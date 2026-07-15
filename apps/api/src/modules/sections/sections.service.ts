import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import type { CacheService } from '../../common/cache/cache.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery } from '../../common/database/pagination.helper';
import type { CreateSectionDto, UpdateSectionDto } from './dto';

const CACHE_KEY = 'sections';

@Injectable()
export class SectionsService {
  private readonly logger = new Logger(SectionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(
    liveOnly?: boolean,
    type?: string,
    opts?: {
      page?: number;
      perPage?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (liveOnly) where.isLive = true;
    if (type) where.sectionType = type;
    if (opts?.search) {
      const q = opts.search;
      where.OR = [
        { sectionLabel: { contains: q, mode: 'insensitive' } },
        { sectionKey: { contains: q, mode: 'insensitive' } },
      ];
    }
    const orderBy: Record<string, string> = opts?.sortBy
      ? { [opts.sortBy]: opts.sortOrder || 'asc' }
      : { displayOrder: 'asc' };
    return paginateQuery(
      (args) => this.prisma.section.findMany({ where, orderBy, ...args }),
      () => this.prisma.section.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findByIdOrKey(idOrKey: string) {
    const cached = await this.cache.get<unknown>(`${CACHE_KEY}:${idOrKey}`);
    if (cached) return cached;
    let section = await this.prisma.section.findUnique({ where: { id: idOrKey } });
    if (!section) section = await this.prisma.section.findFirst({ where: { sectionKey: idOrKey } });
    if (!section) throw new NotFoundException('Section not found');
    await this.cache.set(`${CACHE_KEY}:${idOrKey}`, section);
    return section;
  }

  async create(dto: CreateSectionDto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const section = await this.prisma.section.create({ data: sanitizeStrings(dto) as any });
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return section;
  }

  async update(id: string, dto: UpdateSectionDto) {
    const existing = await this.prisma.section.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Section not found');
    const section = await this.prisma.section.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: sanitizeStrings(dto) as any,
    });
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return section;
  }

  async delete(id: string) {
    const existing = await this.prisma.section.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Section not found');
    await this.prisma.section.delete({ where: { id } });
    await this.cache.delPattern(`${CACHE_KEY}:*`);
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.section.deleteMany({ where: { id: { in: ids } } });
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return { deleted: result.count, failed: ids.length - result.count };
  }

  async bulkUpdate(ids: string[], data: Record<string, unknown>) {
    const sanitized = sanitizeStrings(data);
    const result = await Promise.all(
      ids.map(async (id) => {
        const updated = await this.prisma.section
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .update({ where: { id }, data: sanitized as any })
          .catch(() => null);
        if (!updated) throw new NotFoundException(`Section ${id} not found`);
        return updated;
      }),
    );
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return result;
  }

  async reorder(order: Array<{ id: string; displayOrder: number }>) {
    for (const { id, displayOrder } of order) {
      const updated = await this.prisma.section
        .update({ where: { id }, data: { displayOrder } })
        .catch(() => null);
      if (!updated) throw new NotFoundException(`Section ${id} not found`);
    }
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return this.findAll();
  }
}
