import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { paginateQuery } from '../../common/database/pagination.helper';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(dto: {
    eventName: string;
    pageUrl: string;
    sessionId: string;
    visitorId: string;
    userAgent?: string;
    ipAddress?: string;
    properties?: Record<string, unknown>;
  }) {
    const event = await this.prisma.analyticsEvent.create({
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
    const existingSession = await this.prisma.analyticsSession.findUnique({
      where: { sessionId: dto.sessionId },
    });
    if (existingSession) {
      await this.prisma.analyticsSession.update({
        where: { sessionId: dto.sessionId },
        data: { pageViews: { increment: 1 } },
      });
    } else {
      await this.prisma.analyticsSession.create({
        data: {
          sessionId: dto.sessionId,
          visitorId: dto.visitorId,
          pageViews: 1,
          startedAt: new Date(),
          lastActivityAt: new Date(),
        },
      });
    }
    return event;
  }

  async createSession(data: {
    sessionId: string;
    visitorId?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    deviceType?: string;
    browser?: string;
    country?: string;
    city?: string;
  }) {
    return this.prisma.analyticsSession.create({ data });
  }

  async updateSession(
    sessionId: string,
    data: {
      referrer?: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
      deviceType?: string;
      browser?: string;
      country?: string;
      city?: string;
      pageViews?: number;
      durationSeconds?: number;
      lastActivityAt?: Date;
    },
  ) {
    return this.prisma.analyticsSession.update({ where: { sessionId }, data });
  }

  async trackPageView(data: {
    sessionId?: string;
    pageUrl: string;
    pageTitle?: string;
    referrer?: string;
    scrollDepthPercent?: number;
    timeOnPageSeconds?: number;
    engagement?: Record<string, unknown>;
    viewedAt?: Date;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.pageView.create({ data: data as any });
  }

  async getDashboardStats(period?: string) {
    return this.getSummary(period);
  }

  async getPageViews(opts?: { page?: number; perPage?: number; sessionId?: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (opts?.sessionId) where.sessionId = opts.sessionId;
    return paginateQuery(
      (args) => this.prisma.pageView.findMany({ where, orderBy: { viewedAt: 'desc' }, ...args }),
      () => this.prisma.pageView.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async getEvents(opts?: {
    eventName?: string;
    sessionId?: string;
    page?: number;
    perPage?: number;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (opts?.eventName) where.eventName = opts.eventName;
    if (opts?.sessionId) where.sessionId = opts.sessionId;
    return paginateQuery(
      (args) =>
        this.prisma.analyticsEvent.findMany({ where, orderBy: { createdAt: 'desc' }, ...args }),
      () => this.prisma.analyticsEvent.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async getSummary(period?: string) {
    const now = new Date();
    const periodMs =
      period === '24h'
        ? 86400000
        : period === '7d'
          ? 604800000
          : period === '90d'
            ? 7776000000
            : 2592000000;
    const cutoff = new Date(now.getTime() - periodMs);

    const totalPageViews = await this.prisma.analyticsEvent.count({
      where: { eventName: 'page_view', createdAt: { gte: cutoff } },
    });
    const sessions = await this.prisma.analyticsSession.findMany({
      where: { startedAt: { gte: cutoff } },
    });
    const uniqueVisitors = new Set(sessions.map((s: { visitorId: string | null }) => s.visitorId))
      .size;
    const totalSessions = sessions.length;
    const avgDuration =
      totalSessions > 0
        ? Math.round(
            sessions.reduce(
              (a: number, s: { durationSeconds: number }) => a + s.durationSeconds,
              0,
            ) / totalSessions,
          )
        : 0;
    const bounceRate =
      totalSessions > 0
        ? Math.round(
            (sessions.filter((s: { pageViews: number }) => s.pageViews === 1).length /
              totalSessions) *
              100,
          )
        : 0;

    const pageViewEvents = await this.prisma.analyticsEvent.findMany({
      where: { eventName: 'page_view', createdAt: { gte: cutoff } },
      select: { pageUrl: true, visitorId: true, createdAt: true },
    });
    const pageViewsByUrl: Record<string, number> = {};
    pageViewEvents.forEach((e: { pageUrl: string | null }) => {
      if (e.pageUrl) pageViewsByUrl[e.pageUrl] = (pageViewsByUrl[e.pageUrl] || 0) + 1;
    });

    const topPages = Object.entries(pageViewsByUrl)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Active visitors are independent of the selected period: anyone seen in
    // the last five minutes.
    const activeSessions = await this.prisma.analyticsSession.findMany({
      where: { lastActivityAt: { gte: new Date(now.getTime() - 5 * 60 * 1000) } },
      select: { visitorId: true },
    });
    const activeVisitors = new Set(
      activeSessions.map((s: { visitorId: string | null }) => s.visitorId).filter(Boolean),
    ).size;

    // Daily series for the dashboard charts.
    const dailyMap = new Map<string, { visitors: Set<string>; pageViews: number }>();
    pageViewEvents.forEach((e: { visitorId: string | null; createdAt?: Date }) => {
      if (!e.createdAt) return;
      const date = new Date(e.createdAt).toISOString().slice(0, 10);
      const entry = dailyMap.get(date) ?? { visitors: new Set<string>(), pageViews: 0 };
      if (e.visitorId) entry.visitors.add(e.visitorId);
      entry.pageViews += 1;
      dailyMap.set(date, entry);
    });
    const visitorsOverTime = [...dailyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, entry]) => ({
        date,
        visitors: entry.visitors.size,
        page_views: entry.pageViews,
      }));

    return {
      totalPageViews,
      uniqueVisitors,
      totalSessions,
      avgSessionDurationSeconds: avgDuration,
      bounceRate,
      pageViewsByUrl,
      period: period || '30d',
      // snake_case aliases consumed by the admin dashboard pages.
      total_page_views: totalPageViews,
      total_visitors: uniqueVisitors,
      active_visitors: activeVisitors,
      avg_session_duration: avgDuration,
      bounce_rate: bounceRate / 100,
      top_pages: topPages,
      visitors_over_time: visitorsOverTime,
    };
  }

  async deleteEvent(id: string) {
    try {
      await this.prisma.analyticsEvent.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Analytics event not found');
    }
  }

  async restoreEvent(id: string) {
    const existing = await this.prisma.analyticsEvent.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Analytics event not found');
    return existing;
  }

  async hardDeleteEvent(id: string) {
    try {
      await this.prisma.analyticsEvent.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Analytics event not found');
    }
  }

  async bulkDeleteEvents(ids: string[]) {
    const result = await this.prisma.analyticsEvent.deleteMany({ where: { id: { in: ids } } });
    return { deleted: result.count, failed: ids.length - result.count };
  }

  async getSessions(params?: { page?: number; perPage?: number }) {
    return paginateQuery(
      (args) => this.prisma.analyticsSession.findMany({ orderBy: { startedAt: 'desc' }, ...args }),
      () => this.prisma.analyticsSession.count(),
      params,
    );
  }
}
