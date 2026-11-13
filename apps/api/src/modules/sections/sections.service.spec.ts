import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { PrismaService } from '../../common/database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';

const mockSection = {
  id: 'section-1',
  sectionKey: 'about',
  sectionLabel: 'About Me',
  sectionType: 'personal',
  isLive: true,
  displayOrder: 1,
  content: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  section: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockCache = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  delPattern: jest.fn().mockResolvedValue(undefined),
  getOrSet: jest.fn(),
};

describe('SectionsService', () => {
  let service: SectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<SectionsService>(SectionsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated sections', async () => {
      mockPrisma.section.findMany.mockResolvedValue([mockSection]);
      mockPrisma.section.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by live only', async () => {
      mockPrisma.section.findMany.mockResolvedValue([]);
      mockPrisma.section.count.mockResolvedValue(0);

      await service.findAll(true);

      expect(mockPrisma.section.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isLive: true }),
        }),
      );
    });

    it('should filter by section type', async () => {
      mockPrisma.section.findMany.mockResolvedValue([]);
      mockPrisma.section.count.mockResolvedValue(0);

      await service.findAll(undefined, 'personal');

      expect(mockPrisma.section.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ sectionType: 'personal' }),
        }),
      );
    });

    it('should search by label or key', async () => {
      mockPrisma.section.findMany.mockResolvedValue([]);
      mockPrisma.section.count.mockResolvedValue(0);

      await service.findAll(undefined, undefined, { search: 'about' });

      const callArg = mockPrisma.section.findMany.mock.calls[0][0];
      expect(callArg.where.OR).toBeDefined();
      expect(callArg.where.OR).toHaveLength(2);
    });

    it('should return empty when no sections', async () => {
      mockPrisma.section.findMany.mockResolvedValue([]);
      mockPrisma.section.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findByIdOrKey', () => {
    it('should return section from cache', async () => {
      mockCache.get.mockResolvedValue(mockSection);

      const result = await service.findByIdOrKey('section-1');

      expect(result).toEqual(mockSection);
      expect(mockPrisma.section.findUnique).not.toHaveBeenCalled();
    });

    it('should find by id on cache miss', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.section.findUnique.mockResolvedValue(mockSection);

      const result = await service.findByIdOrKey('section-1');

      expect(result).toEqual(mockSection);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('should fall back to sectionKey lookup', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.section.findUnique.mockResolvedValue(null);
      mockPrisma.section.findFirst.mockResolvedValue(mockSection);

      const result = await service.findByIdOrKey('about');

      expect(result).toHaveProperty('sectionKey', 'about');
      expect(mockPrisma.section.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { sectionKey: 'about' } }),
      );
    });

    it('should throw for non-existent section', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.section.findUnique.mockResolvedValue(null);
      mockPrisma.section.findFirst.mockResolvedValue(null);

      await expect(service.findByIdOrKey('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a section and invalidate cache', async () => {
      mockPrisma.section.create.mockResolvedValue(mockSection);

      const result = await service.create({ sectionKey: 'about', sectionLabel: 'About Me' } as any);

      expect(result).toEqual(mockSection);
      expect(mockCache.delPattern).toHaveBeenCalledWith('sections:*');
    });
  });

  describe('update', () => {
    it('should update existing section', async () => {
      mockPrisma.section.findUnique.mockResolvedValue(mockSection);
      mockPrisma.section.update.mockResolvedValue({ ...mockSection, sectionLabel: 'Updated' });

      const result = await service.update('section-1', { sectionLabel: 'Updated' } as any);

      expect(result.sectionLabel).toBe('Updated');
      expect(mockCache.delPattern).toHaveBeenCalledWith('sections:*');
    });

    it('should throw for non-existent section', async () => {
      mockPrisma.section.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing section', async () => {
      mockPrisma.section.findUnique.mockResolvedValue(mockSection);
      mockPrisma.section.delete.mockResolvedValue(mockSection);

      await service.delete('section-1');

      expect(mockPrisma.section.delete).toHaveBeenCalledWith({ where: { id: 'section-1' } });
      expect(mockCache.delPattern).toHaveBeenCalledWith('sections:*');
    });

    it('should throw for non-existent section', async () => {
      mockPrisma.section.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple sections', async () => {
      mockPrisma.section.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkDelete(['section-1', 'section-2']);

      expect(result.deleted).toBe(2);
      expect(mockCache.delPattern).toHaveBeenCalledWith('sections:*');
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple sections', async () => {
      mockPrisma.section.update.mockResolvedValue(mockSection);

      const result = await service.bulkUpdate(['section-1'], { isLive: false });

      expect(result).toHaveLength(1);
      expect(mockCache.delPattern).toHaveBeenCalledWith('sections:*');
    });

    it('should throw if a section is not found', async () => {
      mockPrisma.section.update.mockRejectedValue(new Error('Not found'));

      await expect(service.bulkUpdate(['nonexistent'], {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reorder', () => {
    it('should reorder sections', async () => {
      mockPrisma.section.update.mockResolvedValue(mockSection);
      mockPrisma.section.findMany.mockResolvedValue([mockSection]);
      mockPrisma.section.count.mockResolvedValue(1);

      const result = await service.reorder([{ id: 'section-1', displayOrder: 2 }]);

      expect(result.data).toHaveLength(1);
      expect(mockPrisma.section.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'section-1' },
          data: { displayOrder: 2 },
        }),
      );
      expect(mockCache.delPattern).toHaveBeenCalledWith('sections:*');
    });

    it('should throw if a section in reorder is not found', async () => {
      mockPrisma.section.update.mockRejectedValue(new Error('Not found'));

      await expect(service.reorder([{ id: 'nonexistent', displayOrder: 1 }])).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
