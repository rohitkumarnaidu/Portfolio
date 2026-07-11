import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { paginateQuery } from '../../common/database/pagination.helper';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(action: string, resource: string, userId: string, resourceId?: string, metadata?: Record<string, unknown>) {
    return this.prisma.adminActivity.create({
      data: {
        action,
        resourceType: resource,
        resourceId,
        adminId: userId,
        details: (metadata || {}) as any,
      },
    });
  }

  async findAll(opts?: { action?: string; resource?: string; userId?: string; page?: number; perPage?: number }) {
    const where: any = {};
    if (opts?.action) where.action = opts.action;
    if (opts?.resource) where.resourceType = opts.resource;
    if (opts?.userId) where.adminId = opts.userId;
    return paginateQuery(
      (args) => this.prisma.adminActivity.findMany({ where, orderBy: { createdAt: 'desc' }, ...args }),
      () => this.prisma.adminActivity.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findById(id: string) {
    const item = await this.prisma.adminActivity.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Activity not found');
    return item;
  }

  async delete(id: string) {
    const existing = await this.prisma.adminActivity.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Activity not found');
    await this.prisma.adminActivity.delete({ where: { id } });
  }

  restore(_id: string) {
    throw new NotFoundException('Activity not found');
  }

  async hardDelete(id: string) {
    const existing = await this.prisma.adminActivity.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Activity not found');
    await this.prisma.adminActivity.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.adminActivity.deleteMany({ where: { id: { in: ids } } });
    return { deleted: result.count, failed: ids.length - result.count };
  }

  async getStats() {
    const items = await this.prisma.adminActivity.findMany();
    const byAction: Record<string, number> = {};
    const byResource: Record<string, number> = {};
    for (const item of items) {
      byAction[item.action] = (byAction[item.action] || 0) + 1;
      byResource[item.resourceType || 'unknown'] = (byResource[item.resourceType || 'unknown'] || 0) + 1;
    }
    return { total: items.length, by_action: byAction, by_resource: byResource };
  }

  async getCsvData() {
    return this.prisma.adminActivity.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
