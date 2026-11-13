import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

const mockRedisClient = {
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
  status: 'ready',
  get: jest.fn(),
  setex: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  scan: jest.fn().mockResolvedValue(['0', []]),
  quit: jest.fn().mockResolvedValue('OK'),
};

jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockRedisClient),
}));

function configWith(redisUrl?: string): ConfigService {
  return { get: jest.fn().mockReturnValue(redisUrl) } as unknown as ConfigService;
}

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient.status = 'ready';
    mockRedisClient.get.mockReset();
    mockRedisClient.setex.mockReset().mockResolvedValue('OK');
    mockRedisClient.del.mockReset().mockResolvedValue(1);
    mockRedisClient.scan.mockReset().mockResolvedValue(['0', []]);
    mockRedisClient.quit.mockReset().mockResolvedValue('OK');
    mockRedisClient.connect.mockReset().mockResolvedValue(undefined);
  });

  describe('without Redis', () => {
    it('does not create a client when no URL is configured', () => {
      const service = new CacheService(configWith(undefined));

      expect(mockRedisClient.connect).not.toHaveBeenCalled();
      expect(service).toBeDefined();
    });

    it('reads and writes become no-ops while the client is not ready', async () => {
      const service = new CacheService(configWith(undefined));

      await expect(service.get('key')).resolves.toBeNull();
      await expect(service.set('key', { a: 1 })).resolves.toBeUndefined();
      await expect(service.del('key')).resolves.toBeUndefined();
      await expect(service.delPattern('key*')).resolves.toBeUndefined();
      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });

    it('falls back to the fetch callback when nothing is cached', async () => {
      const service = new CacheService(configWith(undefined));
      const fetchValue = jest.fn().mockResolvedValue('fresh');

      await expect(service.getOrSet('key', fetchValue)).resolves.toBe('fresh');
      expect(fetchValue).toHaveBeenCalledTimes(1);
    });
  });

  describe('with Redis', () => {
    it('connects on construction', () => {
      new CacheService(configWith('redis://localhost:6379'));

      expect(mockRedisClient.connect).toHaveBeenCalledTimes(1);
      expect(mockRedisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('returns the parsed value for a cached key', async () => {
      mockRedisClient.get.mockResolvedValue('{"id":1}');
      const service = new CacheService(configWith('redis://localhost:6379'));

      await expect(service.get<{ id: number }>('key')).resolves.toEqual({ id: 1 });
    });

    it('returns null for a missing key', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      const service = new CacheService(configWith('redis://localhost:6379'));

      await expect(service.get('key')).resolves.toBeNull();
    });

    it('returns null when the read fails', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('boom'));
      const service = new CacheService(configWith('redis://localhost:6379'));

      await expect(service.get('key')).resolves.toBeNull();
    });

    it('writes with the default TTL and with an explicit one', async () => {
      const service = new CacheService(configWith('redis://localhost:6379'));

      await service.set('key', { a: 1 });
      await service.set('key', { a: 1 }, 30);

      expect(mockRedisClient.setex).toHaveBeenNthCalledWith(1, 'key', 300, '{"a":1}');
      expect(mockRedisClient.setex).toHaveBeenNthCalledWith(2, 'key', 30, '{"a":1}');
    });

    it('swallows write errors', async () => {
      mockRedisClient.setex.mockRejectedValue(new Error('boom'));
      const service = new CacheService(configWith('redis://localhost:6379'));

      await expect(service.set('key', 1)).resolves.toBeUndefined();
    });

    it('deletes a key and swallows errors', async () => {
      const service = new CacheService(configWith('redis://localhost:6379'));

      await service.del('key');
      expect(mockRedisClient.del).toHaveBeenCalledWith('key');

      mockRedisClient.del.mockRejectedValue(new Error('boom'));
      await expect(service.del('key')).resolves.toBeUndefined();
    });

    it('deletes every key matching a pattern', async () => {
      mockRedisClient.scan
        .mockResolvedValueOnce(['1', ['a:1']])
        .mockResolvedValueOnce(['0', ['a:2']]);
      const service = new CacheService(configWith('redis://localhost:6379'));

      await service.delPattern('a:*');

      expect(mockRedisClient.scan).toHaveBeenCalledTimes(2);
      expect(mockRedisClient.del).toHaveBeenCalledWith('a:1');
      expect(mockRedisClient.del).toHaveBeenCalledWith('a:2');
    });

    it('swallows pattern deletion errors', async () => {
      mockRedisClient.scan.mockRejectedValue(new Error('boom'));
      const service = new CacheService(configWith('redis://localhost:6379'));

      await expect(service.delPattern('a:*')).resolves.toBeUndefined();
    });

    it('returns the cached value without calling the fetch callback', async () => {
      mockRedisClient.get.mockResolvedValue('"cached"');
      const service = new CacheService(configWith('redis://localhost:6379'));
      const fetchValue = jest.fn();

      await expect(service.getOrSet('key', fetchValue)).resolves.toBe('cached');
      expect(fetchValue).not.toHaveBeenCalled();
    });

    it('fetches and caches a missing value', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      const service = new CacheService(configWith('redis://localhost:6379'));
      const fetchValue = jest.fn().mockResolvedValue('fresh');

      await expect(service.getOrSet('key', fetchValue)).resolves.toBe('fresh');
      expect(fetchValue).toHaveBeenCalledTimes(1);
      expect(mockRedisClient.setex).toHaveBeenCalledWith('key', 300, '"fresh"');
    });

    it('quits the client on shutdown', async () => {
      const service = new CacheService(configWith('redis://localhost:6379'));

      await service.onModuleDestroy();

      expect(mockRedisClient.quit).toHaveBeenCalledTimes(1);
    });
  });
});
