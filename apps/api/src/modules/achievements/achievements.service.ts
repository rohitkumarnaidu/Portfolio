import { Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery } from '../../common/database/pagination.helper';
import type { CreateAchievementDto, UpdateAchievementDto } from './dto';

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string, opts?: { page?: number; perPage?: number }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (category) where.category = category;
    return paginateQuery(
      (args) =>
        this.prisma.achievement.findMany({ where, orderBy: { displayOrder: 'asc' }, ...args }),
      () => this.prisma.achievement.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findById(id: string) {
    const item = await this.prisma.achievement.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Achievement not found');
    return item;
  }

  async create(dto: CreateAchievementDto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.achievement.create({ data: sanitizeStrings(dto) as any });
  }

  async update(id: string, dto: UpdateAchievementDto) {
    const existing = await this.prisma.achievement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Achievement not found');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.achievement.update({ where: { id }, data: sanitizeStrings(dto) as any });
  }

  async delete(id: string) {
    const existing = await this.prisma.achievement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Achievement not found');
    await this.prisma.achievement.delete({ where: { id } });
  }
}
