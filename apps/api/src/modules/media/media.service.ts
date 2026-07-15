import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import type { PaginationOpts, PaginatedResult } from '../../common/database/pagination.helper';
import { paginate } from '../../common/database/pagination.helper';
import type { CreateMediaDto } from './dto';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts?: PaginationOpts & { mimeType?: string }): Promise<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PaginatedResult<any>
  > {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (opts?.mimeType) where.mimeType = { contains: opts.mimeType, mode: 'insensitive' };
    const items = await this.prisma.mediaAsset.findMany({ where, orderBy: { createdAt: 'desc' } });
    return paginate(items, opts);
  }

  async findById(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Media asset not found');
    return asset;
  }

  async create(dto: CreateMediaDto & { uploadedBy?: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.mediaAsset.create({ data: dto as any });
  }

  async delete(id: string) {
    const existing = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Media asset not found');
    await this.prisma.mediaAsset.delete({ where: { id } });
  }
}
