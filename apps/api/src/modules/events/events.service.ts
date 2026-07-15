import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import { paginateQuery } from '../../common/database/pagination.helper';
import type { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto) {
    return this.prisma.analyticsEvent.create({
      data: {
        eventName: dto.eventName,
        pageUrl: dto.pageUrl,
        sessionId: dto.sessionId,
        visitorId: dto.visitorId,
        userAgent: dto.userAgent,
        ipAddress: dto.ipAddress,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        properties: (dto.properties || {}) as any,
      },
    });
  }

  async findAll(opts?: {
    eventName?: string;
    sessionId?: string;
    visitorId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    perPage?: number;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (opts?.eventName) where.eventName = opts.eventName;
    if (opts?.sessionId) where.sessionId = opts.sessionId;
    if (opts?.visitorId) where.visitorId = opts.visitorId;
    if (opts?.startDate || opts?.endDate) {
      where.createdAt = {};
      if (opts?.startDate) where.createdAt.gte = new Date(opts.startDate);
      if (opts?.endDate) where.createdAt.lte = new Date(opts.endDate);
    }
    return paginateQuery(
      (args) =>
        this.prisma.analyticsEvent.findMany({ where, orderBy: { createdAt: 'desc' }, ...args }),
      () => this.prisma.analyticsEvent.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findById(id: string) {
    const event = await this.prisma.analyticsEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async delete(id: string) {
    try {
      await this.prisma.analyticsEvent.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Event not found');
    }
  }

  async getDistinctEventNames() {
    const events = await this.prisma.analyticsEvent.findMany({
      select: { eventName: true },
      distinct: ['eventName'],
    });
    return events.map((e) => e.eventName);
  }

  async getEventCountByType(opts?: { startDate?: string; endDate?: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (opts?.startDate || opts?.endDate) {
      where.createdAt = {};
      if (opts?.startDate) where.createdAt.gte = new Date(opts.startDate);
      if (opts?.endDate) where.createdAt.lte = new Date(opts.endDate);
    }
    const events = await this.prisma.analyticsEvent.groupBy({
      by: ['eventName'],
      _count: { id: true },
      where,
      orderBy: { _count: { id: 'desc' } },
    });
    return events.map((e) => ({ eventName: e.eventName, count: e._count.id }));
  }

  async queryAuditLogs(opts?: {
    tableName?: string;
    action?: string;
    actorId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    perPage?: number;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (opts?.tableName) where.tableName = opts.tableName;
    if (opts?.action) where.action = opts.action;
    if (opts?.actorId) where.actorId = opts.actorId;
    if (opts?.startDate || opts?.endDate) {
      where.createdAt = {};
      if (opts?.startDate) where.createdAt.gte = new Date(opts.startDate);
      if (opts?.endDate) where.createdAt.lte = new Date(opts.endDate);
    }
    return paginateQuery(
      (args) => this.prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, ...args }),
      () => this.prisma.auditLog.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }
}
