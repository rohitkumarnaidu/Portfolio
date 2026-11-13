import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockEvent = {
  id: 'evt-1',
  eventName: 'page_view',
  pageUrl: '/home',
  sessionId: 'sess-1',
  visitorId: 'vis-1',
  userAgent: null,
  ipAddress: null,
  properties: {},
  createdAt: new Date(),
};

const mockSession = {
  sessionId: 'sess-1',
  visitorId: 'vis-1',
  pageViews: 1,
  durationSeconds: 0,
  startedAt: new Date(),
  lastActivityAt: new Date(),
  referrer: null,
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  deviceType: null,
  browser: null,
  country: null,
  city: null,
};

const mockPageView = {
  id: 'pv-1',
  sessionId: 'sess-1',
  pageUrl: '/home',
  pageTitle: 'Home',
  referrer: null,
  scrollDepthPercent: null,
  timeOnPageSeconds: null,
  engagement: {},
  viewedAt: new Date(),
};

const mockPrisma = {
  analyticsEvent: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  analyticsSession: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  pageView: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should create event and update existing session', async () => {
      mockPrisma.analyticsEvent.create.mockResolvedValue(mockEvent);
      mockPrisma.analyticsSession.findUnique.mockResolvedValue(mockSession);
      mockPrisma.analyticsSession.update.mockResolvedValue({ ...mockSession, pageViews: 2 });

      const result = await service.trackEvent({
        eventName: 'page_view',
        pageUrl: '/home',
        sessionId: 'sess-1',
        visitorId: 'vis-1',
      });

      expect(result).toEqual(mockEvent);
      expect(mockPrisma.analyticsSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { sessionId: 'sess-1' },
          data: { pageViews: { increment: 1 } },
        }),
      );
    });

    it('should create new session if not existing', async () => {
      mockPrisma.analyticsEvent.create.mockResolvedValue(mockEvent);
      mockPrisma.analyticsSession.findUnique.mockResolvedValue(null);
      mockPrisma.analyticsSession.create.mockResolvedValue(mockSession);

      await service.trackEvent({
        eventName: 'page_view',
        pageUrl: '/home',
        sessionId: 'sess-2',
        visitorId: 'vis-2',
      });

      expect(mockPrisma.analyticsSession.create).toHaveBeenCalled();
    });
  });

  describe('createSession', () => {
    it('should create a session', async () => {
      mockPrisma.analyticsSession.create.mockResolvedValue(mockSession);

      const result = await service.createSession({ sessionId: 'sess-1' });

      expect(result).toEqual(mockSession);
    });
  });

  describe('updateSession', () => {
    it('should update a session', async () => {
      mockPrisma.analyticsSession.update.mockResolvedValue({ ...mockSession, pageViews: 5 });

      const result = await service.updateSession('sess-1', { pageViews: 5 });

      expect(result.pageViews).toBe(5);
    });
  });

  describe('trackPageView', () => {
    it('should track a page view', async () => {
      mockPrisma.pageView.create.mockResolvedValue(mockPageView);

      const result = await service.trackPageView({ pageUrl: '/home' });

      expect(result).toEqual(mockPageView);
    });
  });

  describe('getPageViews', () => {
    it('should return paginated page views', async () => {
      mockPrisma.pageView.findMany.mockResolvedValue([mockPageView]);
      mockPrisma.pageView.count.mockResolvedValue(1);

      const result = await service.getPageViews();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by session id', async () => {
      mockPrisma.pageView.findMany.mockResolvedValue([]);
      mockPrisma.pageView.count.mockResolvedValue(0);

      await service.getPageViews({ sessionId: 'sess-1' });

      expect(mockPrisma.pageView.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ sessionId: 'sess-1' }),
        }),
      );
    });
  });

  describe('getEvents', () => {
    it('should return paginated events', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([mockEvent]);
      mockPrisma.analyticsEvent.count.mockResolvedValue(1);

      const result = await service.getEvents();

      expect(result.data).toHaveLength(1);
    });

    it('should filter by event name', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);
      mockPrisma.analyticsEvent.count.mockResolvedValue(0);

      await service.getEvents({ eventName: 'page_view' });

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ eventName: 'page_view' }),
        }),
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should return summary stats', async () => {
      mockPrisma.analyticsEvent.count.mockResolvedValue(10);
      mockPrisma.analyticsSession.findMany.mockResolvedValue([
        { visitorId: 'v1', durationSeconds: 120, pageViews: 3 },
        { visitorId: 'v2', durationSeconds: 60, pageViews: 1 },
      ]);
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([
        { pageUrl: '/home' },
        { pageUrl: '/about' },
      ]);

      const result = await service.getSummary();

      expect(result).toHaveProperty('totalPageViews');
      expect(result).toHaveProperty('uniqueVisitors');
      expect(result).toHaveProperty('totalSessions');
      expect(result).toHaveProperty('avgSessionDurationSeconds');
      expect(result).toHaveProperty('bounceRate');
      expect(result).toHaveProperty('pageViewsByUrl');
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      mockPrisma.analyticsEvent.delete.mockResolvedValue(mockEvent);

      await service.deleteEvent('evt-1');

      expect(mockPrisma.analyticsEvent.delete).toHaveBeenCalledWith({ where: { id: 'evt-1' } });
    });

    it('should throw for non-existent event', async () => {
      mockPrisma.analyticsEvent.delete.mockRejectedValue(new Error('Not found'));

      await expect(service.deleteEvent('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restoreEvent', () => {
    it('should return event if found', async () => {
      mockPrisma.analyticsEvent.findUnique.mockResolvedValue(mockEvent);

      const result = await service.restoreEvent('evt-1');

      expect(result).toEqual(mockEvent);
    });

    it('should throw for non-existent event', async () => {
      mockPrisma.analyticsEvent.findUnique.mockResolvedValue(null);

      await expect(service.restoreEvent('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDeleteEvent', () => {
    it('should permanently delete event', async () => {
      mockPrisma.analyticsEvent.delete.mockResolvedValue(mockEvent);

      await service.hardDeleteEvent('evt-1');

      expect(mockPrisma.analyticsEvent.delete).toHaveBeenCalledWith({ where: { id: 'evt-1' } });
    });

    it('should throw for non-existent event', async () => {
      mockPrisma.analyticsEvent.delete.mockRejectedValue(new Error('Not found'));

      await expect(service.hardDeleteEvent('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDeleteEvents', () => {
    it('should delete multiple events', async () => {
      mockPrisma.analyticsEvent.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkDeleteEvents(['evt-1', 'evt-2']);

      expect(result.deleted).toBe(2);
    });
  });

  describe('getSessions', () => {
    it('should return paginated sessions', async () => {
      mockPrisma.analyticsSession.findMany.mockResolvedValue([mockSession]);
      mockPrisma.analyticsSession.count.mockResolvedValue(1);

      const result = await service.getSessions();

      expect(result.data).toHaveLength(1);
    });
  });
});
