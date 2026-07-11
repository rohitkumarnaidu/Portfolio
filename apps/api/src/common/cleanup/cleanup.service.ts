import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  async run() {
    const now = new Date();
    const results: Record<string, number> = {};

    const analyticsCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const { count: deletedEvents } = await this.prisma.analyticsEvent.deleteMany({
      where: { createdAt: { lt: analyticsCutoff } },
    });
    results.analyticsEvents = deletedEvents;

    const sessionCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const { count: deletedSessions } = await this.prisma.analyticsSession.deleteMany({
      where: { lastActivityAt: { lt: sessionCutoff } },
    });
    results.analyticsSessions = deletedSessions;

    const pageViewCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const { count: deletedPageViews } = await this.prisma.pageView.deleteMany({
      where: { viewedAt: { lt: pageViewCutoff } },
    });
    results.pageViews = deletedPageViews;

    const leadCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const { count: hardDeletedLeads } = await this.prisma.lead.deleteMany({
      where: { deletedAt: { not: null, lt: leadCutoff } },
    });
    results.hardDeletedLeads = hardDeletedLeads;

    const chatCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oldConversations = await this.prisma.chatConversation.findMany({
      where: { lastActivityAt: { lt: chatCutoff } },
      select: { id: true },
    });
    if (oldConversations.length > 0) {
      const ids = oldConversations.map((c: { id: string }) => c.id);
      await this.prisma.chatMessage.deleteMany({ where: { conversationId: { in: ids } } });
      const { count: deletedChats } = await this.prisma.chatConversation.deleteMany({ where: { id: { in: ids } } });
      results.chatConversations = deletedChats;
    }

    this.logger.log(`Cleanup complete: ${JSON.stringify(results)}`);
    return { cleaned: results, runAt: now.toISOString() };
  }
}
