import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockAchievement = {
  id: 'ach-1',
  title: 'Won Hackathon',
  description: 'First place at hackathon',
  category: 'award',
  icon: 'trophy',
  date: new Date('2024-01-01'),
  displayOrder: 1,
  isFeatured: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  achievement: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('AchievementsService', () => {
  let service: AchievementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AchievementsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated achievements', async () => {
      mockPrisma.achievement.findMany.mockResolvedValue([mockAchievement]);
      mockPrisma.achievement.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by category', async () => {
      mockPrisma.achievement.findMany.mockResolvedValue([]);
      mockPrisma.achievement.count.mockResolvedValue(0);

      await service.findAll('award');

      expect(mockPrisma.achievement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'award' }),
        }),
      );
    });

    it('should return empty when no achievements', async () => {
      mockPrisma.achievement.findMany.mockResolvedValue([]);
      mockPrisma.achievement.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return achievement by id', async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue(mockAchievement);

      const result = await service.findById('ach-1');

      expect(result).toEqual(mockAchievement);
    });

    it('should throw for non-existent achievement', async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an achievement', async () => {
      mockPrisma.achievement.create.mockResolvedValue(mockAchievement);

      const result = await service.create({ title: 'Won Hackathon' } as any);

      expect(result).toEqual(mockAchievement);
    });
  });

  describe('update', () => {
    it('should update existing achievement', async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue(mockAchievement);
      mockPrisma.achievement.update.mockResolvedValue({ ...mockAchievement, title: 'Updated' });

      const result = await service.update('ach-1', { title: 'Updated' } as any);

      expect(result.title).toBe('Updated');
    });

    it('should throw for non-existent achievement', async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing achievement', async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue(mockAchievement);
      mockPrisma.achievement.delete.mockResolvedValue(mockAchievement);

      await service.delete('ach-1');

      expect(mockPrisma.achievement.delete).toHaveBeenCalledWith({ where: { id: 'ach-1' } });
    });

    it('should throw for non-existent achievement', async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
