import { Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery } from '../../common/database/pagination.helper';
import type { CreatePressFeatureDto, UpdatePressFeatureDto } from './dto';

@Injectable()
export class PressFeaturesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts?: { page?: number; perPage?: number }) {
    return paginateQuery(
      (args) => this.prisma.pressFeature.findMany({ orderBy: { displayOrder: 'asc' }, ...args }),
      () => this.prisma.pressFeature.count(),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findById(id: string) {
    const item = await this.prisma.pressFeature.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Press feature not found');
    return item;
  }

  async create(dto: CreatePressFeatureDto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.pressFeature.create({ data: sanitizeStrings(dto) as any });
  }

  async update(id: string, dto: UpdatePressFeatureDto) {
    const existing = await this.prisma.pressFeature.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Press feature not found');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.pressFeature.update({ where: { id }, data: sanitizeStrings(dto) as any });
  }

  async delete(id: string) {
    const existing = await this.prisma.pressFeature.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Press feature not found');
    await this.prisma.pressFeature.delete({ where: { id } });
  }
}
