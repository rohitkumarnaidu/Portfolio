import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { paginateQuery } from '../../common/database/pagination.helper';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts?: { page?: number; perPage?: number }) {
    return paginateQuery(
      (args) => this.prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' }, ...args }),
      () => this.prisma.apiKey.count(),
      opts,
    );
  }

  async findById(id: string) {
    const apiKey = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!apiKey) throw new NotFoundException('API key not found');
    return apiKey;
  }

  async create(name: string, permissions?: string) {
    const rawKey = `pk_${crypto.randomBytes(32).toString('hex')}`;
    const keyPrefix = rawKey.substring(0, 10);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const apiKey = await this.prisma.apiKey.create({
      data: { name, keyHash, keyPrefix, permissions: permissions || 'read' },
    });
    return { ...apiKey, rawKey };
  }

  async revoke(id: string) {
    const existing = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('API key not found');
    return this.prisma.apiKey.update({
      where: { id },
      data: { isActive: false, revokedAt: new Date() },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('API key not found');
    await this.prisma.apiKey.delete({ where: { id } });
  }

  async validate(key: string) {
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const apiKey = await this.prisma.apiKey.findUnique({ where: { keyHash } });
    if (!apiKey?.isActive) return null;
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;
    return apiKey;
  }
}
