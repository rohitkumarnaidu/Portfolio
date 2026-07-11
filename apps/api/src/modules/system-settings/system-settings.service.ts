import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class SystemSettingsService {
  private readonly logger = new Logger(SystemSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(group?: string) {
    const where: any = {};
    if (group) where.settingGroup = group;
    return this.prisma.systemSetting.findMany({ where, orderBy: { settingKey: 'asc' } });
  }

  async findByKey(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({ where: { settingKey: key } });
    if (!setting) throw new NotFoundException(`Setting "${key}" not found`);
    return setting;
  }

  async upsert(key: string, value: string, group?: string, description?: string, dataType?: string) {
    return this.prisma.systemSetting.upsert({
      where: { settingKey: key },
      update: { settingValue: value, settingGroup: group, description, dataType },
      create: { settingKey: key, settingValue: value, settingGroup: group ?? 'general', description, dataType },
    });
  }

  async delete(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({ where: { settingKey: key } });
    if (!setting) throw new NotFoundException(`Setting "${key}" not found`);
    await this.prisma.systemSetting.delete({ where: { settingKey: key } });
  }
}
