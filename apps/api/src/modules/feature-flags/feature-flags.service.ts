import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateFeatureFlagDto, UpdateFeatureFlagDto } from './dto';

@Injectable()
export class FeatureFlagsService {
  private readonly logger = new Logger(FeatureFlagsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.featureFlag.findMany({ orderBy: { flagKey: 'asc' } });
  }

  async findByKey(key: string) {
    const flag = await this.prisma.featureFlag.findUnique({ where: { flagKey: key } });
    if (!flag) throw new NotFoundException(`Feature flag "${key}" not found`);
    return flag;
  }

  async isEnabled(key: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({ where: { flagKey: key } });
    if (!flag?.isEnabled) return false;
    if (flag.rolloutPercentage >= 100) return true;
    if (flag.rolloutPercentage <= 0) return false;
    const hash = key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return hash % 100 < flag.rolloutPercentage;
  }

  async create(dto: CreateFeatureFlagDto) {
    return this.prisma.featureFlag.create({
      data: {
        flagKey: dto.flagKey,
        description: dto.description,
        isEnabled: dto.isEnabled ?? false,
        targetingRules: (dto.targetingRules ?? {}) as any,
        rolloutPercentage: dto.rolloutPercentage ?? 0,
      },
    });
  }

  async update(key: string, dto: UpdateFeatureFlagDto) {
    const existing = await this.prisma.featureFlag.findUnique({ where: { flagKey: key } });
    if (!existing) throw new NotFoundException(`Feature flag "${key}" not found`);
    const data: any = {};
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.isEnabled !== undefined) data.isEnabled = dto.isEnabled;
    if (dto.targetingRules !== undefined) data.targetingRules = dto.targetingRules as any;
    if (dto.rolloutPercentage !== undefined) data.rolloutPercentage = dto.rolloutPercentage;
    return this.prisma.featureFlag.update({ where: { flagKey: key }, data });
  }

  async delete(key: string) {
    const existing = await this.prisma.featureFlag.findUnique({ where: { flagKey: key } });
    if (!existing) throw new NotFoundException(`Feature flag "${key}" not found`);
    await this.prisma.featureFlag.delete({ where: { flagKey: key } });
  }
}
