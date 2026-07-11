import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery } from '../../common/database/pagination.helper';
import { CreateSkillDto, UpdateSkillDto } from './dto';

const CACHE_KEY = 'skills';

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(category?: string, opts?: { page?: number; perPage?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
    const where: any = {};
    if (category) where.category = category;
    if (opts?.search) {
      const q = opts.search;
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }
    const orderBy: any = opts?.sortBy ? { [opts.sortBy]: opts.sortOrder || 'asc' } : { displayOrder: 'asc' };
    return paginateQuery(
      (args) => this.prisma.skill.findMany({ where, orderBy, ...args }),
      () => this.prisma.skill.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findById(id: string) {
    const cached = await this.cache.get<unknown>(`${CACHE_KEY}:${id}`);
    if (cached) return cached;
    const item = await this.prisma.skill.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Skill not found');
    await this.cache.set(`${CACHE_KEY}:${id}`, item);
    return item;
  }

  async create(dto: CreateSkillDto) {
    const skill = await this.prisma.skill.create({ data: sanitizeStrings(dto) as any });
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return skill;
  }

  async update(id: string, dto: UpdateSkillDto) {
    const existing = await this.prisma.skill.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Skill not found');
    const skill = await this.prisma.skill.update({ where: { id }, data: sanitizeStrings(dto) as any });
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return skill;
  }

  async toggleFeatured(id: string) {
    const existing = await this.prisma.skill.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Skill not found');
    const skill = await this.prisma.skill.update({ where: { id }, data: { isFeatured: !existing.isFeatured } });
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return skill;
  }

  async delete(id: string) {
    const existing = await this.prisma.skill.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Skill not found');
    await this.prisma.skill.delete({ where: { id } });
    await this.cache.delPattern(`${CACHE_KEY}:*`);
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.skill.deleteMany({ where: { id: { in: ids } } });
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return { deleted: result.count, failed: ids.length - result.count };
  }

  async bulkUpdate(ids: string[], data: Record<string, any>) {
    const sanitized = sanitizeStrings(data);
    const result = await Promise.all(
      ids.map(async (id) => {
        const updated = await this.prisma.skill.update({ where: { id }, data: sanitized as any }).catch(() => null);
        if (!updated) throw new NotFoundException(`Skill ${id} not found`);
        return updated;
      }),
    );
    await this.cache.delPattern(`${CACHE_KEY}:*`);
    return result;
  }
}
