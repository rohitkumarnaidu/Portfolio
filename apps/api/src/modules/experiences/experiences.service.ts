import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import type { CacheService } from '../../common/cache/cache.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery } from '../../common/database/pagination.helper';
import type { CreateExperienceDto, UpdateExperienceDto } from './dto';

const CACHE_KEY = 'experiences';

@Injectable()
export class ExperiencesService {
  private readonly logger = new Logger(ExperiencesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(
    visibleOnly?: boolean,
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
    if (visibleOnly) where.isVisible = true;
    if (opts?.search) {
      const q = opts.search;
      where.OR = [
        { role: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};
    if (opts?.sortBy) {
      orderBy[opts.sortBy] = opts.sortOrder || 'asc';
    } else {
      orderBy.displayOrder = 'asc';
    }
    return paginateQuery(
      (args) => this.prisma.experience.findMany({ where, orderBy, ...args }),
      () => this.prisma.experience.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findById(id: string) {
    const cached = await this.cache.get<unknown>(`${CACHE_KEY}:${id}`);
    if (cached) return cached;
    const item = await this.prisma.experience.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Experience not found');
    await this.cache.set(`${CACHE_KEY}:${id}`, item);
    return item;
  }

  async create(dto: CreateExperienceDto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = await this.prisma.experience.create({ data: sanitizeStrings(dto) as any });
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return item;
  }

  async update(id: string, dto: UpdateExperienceDto) {
    const item = await this.prisma.experience
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ where: { id }, data: sanitizeStrings(dto) as any })
      .catch(() => {
        throw new NotFoundException('Experience not found');
      });
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return item;
  }

  async delete(id: string) {
    try {
      await this.prisma.experience.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Experience not found');
    }
    await this.cache.delPattern(`${CACHE_KEY}:*`);
  }

  async restore(id: string) {
    const existing = await this.prisma.experience.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Experience not found');
    return existing;
  }

  async hardDelete(id: string) {
    try {
      await this.prisma.experience.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Experience not found');
    }
    await this.cache.delPattern(`${CACHE_KEY}:*`);
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.experience.deleteMany({ where: { id: { in: ids } } });
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return { deleted: result.count, failed: ids.length - result.count };
  }

  async bulkUpdate(ids: string[], data: Record<string, unknown>) {
    const found = await this.prisma.experience.findMany({ where: { id: { in: ids } } });
    const foundIds = found.map((i: { id: string }) => i.id);
    const missing = ids.filter((id) => !foundIds.includes(id));
    if (missing.length) throw new NotFoundException(`Experiences ${missing.join(', ')} not found`);
    await this.prisma.experience.updateMany({
      where: { id: { in: ids } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: sanitizeStrings(data) as any,
    });
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return this.prisma.experience.findMany({
      where: { id: { in: ids } },
      orderBy: { displayOrder: 'asc' },
    });
  }
}
