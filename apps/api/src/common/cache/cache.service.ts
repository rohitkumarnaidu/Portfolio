import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

const DEFAULT_TTL = 5 * 60;

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('app.REDIS_URL');
    if (redisUrl) {
      try {
        this.client = new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => Math.min(times * 200, 3000),
        });
        this.client.on('error', (err) => this.logger.error('Redis error', err));
        this.client.connect().catch((err) => {
          this.logger.warn(`Redis connection failed, caching disabled: ${err.message}`);
          this.client = null;
        });
      } catch (err) {
        this.logger.warn(`Redis init failed, caching disabled: ${err}`);
      }
    }
  }

  private get isReady(): boolean {
    return this.client !== null && this.client.status === 'ready';
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isReady) return null;
    try {
      const raw = await this.client!.get(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(`Cache get error for ${key}: ${err}`);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = DEFAULT_TTL): Promise<void> {
    if (!this.isReady) return;
    try {
      const serialized = JSON.stringify(value);
      await this.client!.setex(key, ttlSeconds, serialized);
    } catch (err) {
      this.logger.warn(`Cache set error for ${key}: ${err}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isReady) return;
    try {
      await this.client!.del(key);
    } catch (err) {
      this.logger.warn(`Cache del error for ${key}: ${err}`);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isReady) return;
    try {
      let cursor = '0';
      do {
        const result: [string, string[]] = await (this.client! as any).scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = result[0];
        const keys = result[1];
        if (keys.length > 0) {
          await this.client!.del(...keys);
        }
      } while (cursor !== '0');
    } catch (err) {
      this.logger.warn(`Cache delPattern error for ${pattern}: ${err}`);
    }
  }

  async getOrSet<T>(key: string, fetch: () => Promise<T>, ttlSeconds = DEFAULT_TTL): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await fetch();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }
}
