import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { PrismaService } from '../../common/database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';

const mockSkill = {
  id: 'skill-1',
  name: 'TypeScript',
  category: 'language',
  icon: 'typescript-icon',
  proficiency: 90,
  displayOrder: 1,
  isFeatured: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  skill: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
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

describe('SkillsService', () => {
  let service: SkillsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated skills', async () => {
      mockPrisma.skill.findMany.mockResolvedValue([mockSkill]);
      mockPrisma.skill.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by category', async () => {
      mockPrisma.skill.findMany.mockResolvedValue([]);
      mockPrisma.skill.count.mockResolvedValue(0);

      await service.findAll('language');

      expect(mockPrisma.skill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'language' }),
        }),
      );
    });

    it('should search by name or category', async () => {
      mockPrisma.skill.findMany.mockResolvedValue([]);
      mockPrisma.skill.count.mockResolvedValue(0);

      await service.findAll(undefined, { search: 'type' });

      const callArg = mockPrisma.skill.findMany.mock.calls[0][0];
      expect(callArg.where.OR).toBeDefined();
      expect(callArg.where.OR).toHaveLength(2);
    });

    it('should return empty result when no skills exist', async () => {
      mockPrisma.skill.findMany.mockResolvedValue([]);
      mockPrisma.skill.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findById', () => {
    it('should return skill from cache', async () => {
      mockCache.get.mockResolvedValue(mockSkill);

      const result = await service.findById('skill-1');

      expect(result).toEqual(mockSkill);
      expect(mockPrisma.skill.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache on cache miss', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.skill.findUnique.mockResolvedValue(mockSkill);

      const result = await service.findById('skill-1');

      expect(result).toEqual(mockSkill);
      expect(mockPrisma.skill.findUnique).toHaveBeenCalledWith({ where: { id: 'skill-1' } });
      expect(mockCache.set).toHaveBeenCalledWith('skills:skill-1', mockSkill);
    });

    it('should throw for non-existent skill', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.skill.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a skill and invalidate cache', async () => {
      mockPrisma.skill.create.mockResolvedValue(mockSkill);

      const result = await service.create({
        name: 'TypeScript',
        category: 'language',
        icon: 'typescript-icon',
      } as any);

      expect(result).toEqual(mockSkill);
      expect(mockCache.delPattern).toHaveBeenCalledWith('skills:*');
    });
  });

  describe('update', () => {
    it('should update existing skill', async () => {
      mockPrisma.skill.findUnique.mockResolvedValue(mockSkill);
      mockPrisma.skill.update.mockResolvedValue({ ...mockSkill, name: 'Updated' });

      const result = await service.update('skill-1', { name: 'Updated' } as any);

      expect(result.name).toBe('Updated');
      expect(mockCache.delPattern).toHaveBeenCalledWith('skills:*');
    });

    it('should throw for non-existent skill', async () => {
      mockPrisma.skill.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleFeatured', () => {
    it('should toggle isFeatured flag', async () => {
      mockPrisma.skill.findUnique.mockResolvedValue(mockSkill);
      mockPrisma.skill.update.mockResolvedValue({ ...mockSkill, isFeatured: true });

      const result = await service.toggleFeatured('skill-1');

      expect(result.isFeatured).toBe(true);
      expect(mockPrisma.skill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'skill-1' },
          data: expect.objectContaining({ isFeatured: true }),
        }),
      );
      expect(mockCache.delPattern).toHaveBeenCalledWith('skills:*');
    });

    it('should throw for non-existent skill', async () => {
      mockPrisma.skill.findUnique.mockResolvedValue(null);

      await expect(service.toggleFeatured('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing skill', async () => {
      mockPrisma.skill.findUnique.mockResolvedValue(mockSkill);
      mockPrisma.skill.delete.mockResolvedValue(mockSkill);

      await service.delete('skill-1');

      expect(mockPrisma.skill.delete).toHaveBeenCalledWith({ where: { id: 'skill-1' } });
      expect(mockCache.delPattern).toHaveBeenCalledWith('skills:*');
    });

    it('should throw for non-existent skill', async () => {
      mockPrisma.skill.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple skills', async () => {
      mockPrisma.skill.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkDelete(['skill-1', 'skill-2']);

      expect(result.deleted).toBe(2);
      expect(mockCache.delPattern).toHaveBeenCalledWith('skills:*');
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple skills', async () => {
      mockPrisma.skill.update.mockResolvedValue(mockSkill);

      const result = await service.bulkUpdate(['skill-1'], { category: 'framework' });

      expect(result).toHaveLength(1);
      expect(mockCache.delPattern).toHaveBeenCalledWith('skills:*');
    });

    it('should throw if a skill is not found', async () => {
      mockPrisma.skill.update.mockRejectedValue(new Error('Not found'));

      await expect(service.bulkUpdate(['nonexistent'], {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
