import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockApiKey = {
  id: 'key-1',
  name: 'Production API Key',
  keyHash: 'a1b2c3d4e5f6...',
  keyPrefix: 'pk_a1b2c3',
  permissions: 'read',
  isActive: true,
  expiresAt: null,
  revokedAt: null,
  lastUsedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  apiKey: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ApiKeysService', () => {
  let service: ApiKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiKeysService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated api keys', async () => {
      mockPrisma.apiKey.findMany.mockResolvedValue([mockApiKey]);
      mockPrisma.apiKey.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should return empty when no api keys', async () => {
      mockPrisma.apiKey.findMany.mockResolvedValue([]);
      mockPrisma.apiKey.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return an api key by id', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue(mockApiKey);

      const result = await service.findById('key-1');

      expect(result).toEqual(mockApiKey);
    });

    it('should throw for non-existent api key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an api key and return raw key', async () => {
      mockPrisma.apiKey.create.mockResolvedValue(mockApiKey);

      const result = await service.create('Production API Key', 'read');

      expect(result).toHaveProperty('rawKey');
      expect(result).toHaveProperty('keyHash');
      expect(result).toHaveProperty('keyPrefix');
      expect(result.name).toBe('Production API Key');
      expect(mockPrisma.apiKey.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Production API Key',
            permissions: 'read',
          }),
        }),
      );
    });

    it('should default permissions to read', async () => {
      mockPrisma.apiKey.create.mockResolvedValue(mockApiKey);

      await service.create('Test Key');

      expect(mockPrisma.apiKey.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ permissions: 'read' }),
        }),
      );
    });
  });

  describe('revoke', () => {
    it('should revoke an active api key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue(mockApiKey);
      mockPrisma.apiKey.update.mockResolvedValue({
        ...mockApiKey,
        isActive: false,
        revokedAt: new Date(),
      });

      const result = await service.revoke('key-1');

      expect(result.isActive).toBe(false);
      expect(result.revokedAt).toBeInstanceOf(Date);
      expect(mockPrisma.apiKey.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'key-1' },
          data: expect.objectContaining({ isActive: false }),
        }),
      );
    });

    it('should throw for non-existent api key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue(null);

      await expect(service.revoke('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing api key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue(mockApiKey);
      mockPrisma.apiKey.delete.mockResolvedValue(mockApiKey);

      await service.delete('key-1');

      expect(mockPrisma.apiKey.delete).toHaveBeenCalledWith({ where: { id: 'key-1' } });
    });

    it('should throw for non-existent api key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validate', () => {
    it('should return api key for valid key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue(mockApiKey);

      const result = await service.validate('some-raw-key');

      expect(result).toEqual(mockApiKey);
    });

    it('should return null for inactive key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue({ ...mockApiKey, isActive: false });

      const result = await service.validate('inactive-key');

      expect(result).toBeNull();
    });

    it('should return null for expired key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue({
        ...mockApiKey,
        expiresAt: new Date('2020-01-01'),
      });

      const result = await service.validate('expired-key');

      expect(result).toBeNull();
    });

    it('should return null for non-existent key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue(null);

      const result = await service.validate('unknown-key');

      expect(result).toBeNull();
    });
  });
});
