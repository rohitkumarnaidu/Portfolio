import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockActivity = {
  id: 'act-1',
  action: 'login',
  resourceType: 'auth',
  resourceId: 'user-1',
  adminId: 'admin-1',
  details: {},
  createdAt: new Date(),
};

const mockPrisma = {
  adminActivity: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('ActivitiesService', () => {
  let service: ActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivitiesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should log an activity', async () => {
      mockPrisma.adminActivity.create.mockResolvedValue(mockActivity);

      const result = await service.log('login', 'auth', 'admin-1', 'user-1', { ip: '127.0.0.1' });

      expect(result).toEqual(mockActivity);
      expect(mockPrisma.adminActivity.create).toHaveBeenCalledWith({
        data: {
          action: 'login',
          resourceType: 'auth',
          resourceId: 'user-1',
          adminId: 'admin-1',
          details: { ip: '127.0.0.1' },
        },
      });
    });

    it('should log activity without optional fields', async () => {
      mockPrisma.adminActivity.create.mockResolvedValue({
        ...mockActivity,
        resourceId: null,
        details: {},
      });

      await service.log('logout', 'auth', 'admin-1');

      expect(mockPrisma.adminActivity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'logout',
            adminId: 'admin-1',
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated activities', async () => {
      mockPrisma.adminActivity.findMany.mockResolvedValue([mockActivity]);
      mockPrisma.adminActivity.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by action', async () => {
      mockPrisma.adminActivity.findMany.mockResolvedValue([]);
      mockPrisma.adminActivity.count.mockResolvedValue(0);

      await service.findAll({ action: 'login' });

      expect(mockPrisma.adminActivity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ action: 'login' }),
        }),
      );
    });

    it('should filter by resource type', async () => {
      mockPrisma.adminActivity.findMany.mockResolvedValue([]);
      mockPrisma.adminActivity.count.mockResolvedValue(0);

      await service.findAll({ resource: 'auth' });

      expect(mockPrisma.adminActivity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ resourceType: 'auth' }),
        }),
      );
    });

    it('should filter by user', async () => {
      mockPrisma.adminActivity.findMany.mockResolvedValue([]);
      mockPrisma.adminActivity.count.mockResolvedValue(0);

      await service.findAll({ userId: 'admin-1' });

      expect(mockPrisma.adminActivity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ adminId: 'admin-1' }),
        }),
      );
    });

    it('should return empty when no activities', async () => {
      mockPrisma.adminActivity.findMany.mockResolvedValue([]);
      mockPrisma.adminActivity.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return an activity by id', async () => {
      mockPrisma.adminActivity.findUnique.mockResolvedValue(mockActivity);

      const result = await service.findById('act-1');

      expect(result).toEqual(mockActivity);
    });

    it('should throw for non-existent activity', async () => {
      mockPrisma.adminActivity.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing activity', async () => {
      mockPrisma.adminActivity.findUnique.mockResolvedValue(mockActivity);
      mockPrisma.adminActivity.delete.mockResolvedValue(mockActivity);

      await service.delete('act-1');

      expect(mockPrisma.adminActivity.delete).toHaveBeenCalledWith({ where: { id: 'act-1' } });
    });

    it('should throw for non-existent activity', async () => {
      mockPrisma.adminActivity.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should throw NotFoundException', async () => {
      await expect(service.restore('any-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete an activity', async () => {
      mockPrisma.adminActivity.findUnique.mockResolvedValue(mockActivity);
      mockPrisma.adminActivity.delete.mockResolvedValue(mockActivity);

      await service.hardDelete('act-1');

      expect(mockPrisma.adminActivity.delete).toHaveBeenCalledWith({ where: { id: 'act-1' } });
    });

    it('should throw for non-existent activity', async () => {
      mockPrisma.adminActivity.findUnique.mockResolvedValue(null);

      await expect(service.hardDelete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple activities', async () => {
      mockPrisma.adminActivity.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.bulkDelete(['act-1', 'act-2', 'act-3']);

      expect(result.deleted).toBe(3);
    });
  });

  describe('getStats', () => {
    it('should return activity stats', async () => {
      mockPrisma.adminActivity.findMany.mockResolvedValue([
        { action: 'login', resourceType: 'auth' },
        { action: 'login', resourceType: 'auth' },
        { action: 'update', resourceType: 'blog' },
      ]);

      const result = await service.getStats();

      expect(result.total).toBe(3);
      expect(result.byAction).toEqual({ login: 2, update: 1 });
      expect(result.byResource).toEqual({ auth: 2, blog: 1 });
    });
  });

  describe('getCsvData', () => {
    it('should return all activities ordered by date', async () => {
      mockPrisma.adminActivity.findMany.mockResolvedValue([mockActivity]);

      const result = await service.getCsvData();

      expect(result).toHaveLength(1);
      expect(mockPrisma.adminActivity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });
  });
});
