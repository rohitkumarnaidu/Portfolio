import { Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import { paginateQuery } from '../../common/database/pagination.helper';
import type { CreateFeatureFlagDto, UpdateFeatureFlagDto } from './dto';

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts?: { isEnabled?: boolean; page?: number; perPage?: number }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (opts?.isEnabled !== undefined) where.isEnabled = opts.isEnabled;
    return paginateQuery(
      (args) =>
        this.prisma.featureFlag.findMany({ where, orderBy: { createdAt: 'desc' }, ...args }),
      () => this.prisma.featureFlag.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findOne(id: string) {
    const item = await this.prisma.featureFlag.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Feature flag not found');
    return item;
  }

  async findByKey(flagKey: string) {
    const item = await this.prisma.featureFlag.findUnique({ where: { flagKey } });
    if (!item) throw new NotFoundException('Feature flag not found');
    return item;
  }

  async create(dto: CreateFeatureFlagDto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.featureFlag.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateFeatureFlagDto) {
    const existing = await this.prisma.featureFlag.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Feature flag not found');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.featureFlag.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    const existing = await this.prisma.featureFlag.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Feature flag not found');
    await this.prisma.featureFlag.delete({ where: { id } });
  }

  async isEnabled(flagKey: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({ where: { flagKey } });
    return flag?.isEnabled ?? false;
  }

  async delete(flagKey: string) {
    const existing = await this.prisma.featureFlag.findUnique({ where: { flagKey } });
    if (!existing) throw new NotFoundException('Feature flag not found');
    await this.prisma.featureFlag.delete({ where: { flagKey } });
  }
}
