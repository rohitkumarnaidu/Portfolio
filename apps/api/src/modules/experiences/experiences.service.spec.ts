import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { PrismaService } from '../../common/database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';

const mockExperience = {
  id: 'exp-1',
  role: 'Software Engineer',
  company: 'Acme Corp',
  location: 'Remote',
  startDate: new Date('2022-01-01'),
  endDate: null,
  description: 'Built cool stuff',
  achievements: ['Shipped feature X'],
  technologies: ['TypeScript', 'React'],
  isVisible: true,
  displayOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  experience: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
  },
};

const mockCache = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  delPattern: jest.fn().mockResolvedValue(undefined),
  getOrSet: jest.fn(),
};

describe('ExperiencesService', () => {
  let service: ExperiencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperiencesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<ExperiencesService>(ExperiencesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated experiences', async () => {
      mockPrisma.experience.findMany.mockResolvedValue([mockExperience]);
      mockPrisma.experience.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by visible only', async () => {
      mockPrisma.experience.findMany.mockResolvedValue([]);
      mockPrisma.experience.count.mockResolvedValue(0);

      await service.findAll(true);

      expect(mockPrisma.experience.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isVisible: true }),
        }),
      );
    });

    it('should search by role, company, or location', async () => {
      mockPrisma.experience.findMany.mockResolvedValue([]);
      mockPrisma.experience.count.mockResolvedValue(0);

      await service.findAll(undefined, { search: 'engineer' });

      const callArg = mockPrisma.experience.findMany.mock.calls[0][0];
      expect(callArg.where.OR).toBeDefined();
      expect(callArg.where.OR).toHaveLength(3);
    });

    it('should return empty when no experiences', async () => {
      mockPrisma.experience.findMany.mockResolvedValue([]);
      mockPrisma.experience.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return experience from cache', async () => {
      mockCache.get.mockResolvedValue(mockExperience);

      const result = await service.findById('exp-1');

      expect(result).toEqual(mockExperience);
      expect(mockPrisma.experience.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch from database on cache miss', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.experience.findUnique.mockResolvedValue(mockExperience);

      const result = await service.findById('exp-1');

      expect(result).toEqual(mockExperience);
      expect(mockCache.set).toHaveBeenCalledWith('experiences:exp-1', mockExperience);
    });

    it('should throw for non-existent experience', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.experience.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an experience and invalidate cache', async () => {
      mockPrisma.experience.create.mockResolvedValue(mockExperience);

      const result = await service.create({
        role: 'Software Engineer',
        company: 'Acme Corp',
      } as any);

      expect(result).toEqual(mockExperience);
      expect(mockCache.delPattern).toHaveBeenCalledWith('experiences:*');
    });
  });

  describe('update', () => {
    it('should update existing experience', async () => {
      mockPrisma.experience.update.mockResolvedValue({ ...mockExperience, role: 'Updated' });

      const result = await service.update('exp-1', { role: 'Updated' } as any);

      expect(result.role).toBe('Updated');
      expect(mockCache.delPattern).toHaveBeenCalledWith('experiences:*');
    });

    it('should throw for non-existent experience', async () => {
      mockPrisma.experience.update.mockRejectedValue(new Error('Record not found'));

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing experience', async () => {
      mockPrisma.experience.delete.mockResolvedValue(mockExperience);

      await service.delete('exp-1');

      expect(mockPrisma.experience.delete).toHaveBeenCalledWith({ where: { id: 'exp-1' } });
      expect(mockCache.delPattern).toHaveBeenCalledWith('experiences:*');
    });

    it('should throw for non-existent experience', async () => {
      mockPrisma.experience.delete.mockRejectedValue(new Error('Not found'));

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should throw NotFoundException', async () => {
      await expect(service.restore('any-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete experience', async () => {
      mockPrisma.experience.delete.mockResolvedValue(mockExperience);

      await service.hardDelete('exp-1');

      expect(mockPrisma.experience.delete).toHaveBeenCalledWith({ where: { id: 'exp-1' } });
      expect(mockCache.delPattern).toHaveBeenCalledWith('experiences:*');
    });

    it('should throw for non-existent experience', async () => {
      mockPrisma.experience.delete.mockRejectedValue(new Error('Not found'));

      await expect(service.hardDelete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple experiences', async () => {
      mockPrisma.experience.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkDelete(['exp-1', 'exp-2']);

      expect(result.deleted).toBe(2);
      expect(mockCache.delPattern).toHaveBeenCalledWith('experiences:*');
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple experiences', async () => {
      mockPrisma.experience.findMany.mockResolvedValue([mockExperience]);
      mockPrisma.experience.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.experience.findMany.mockResolvedValueOnce([mockExperience]);

      const result = await service.bulkUpdate(['exp-1'], { isVisible: false });

      expect(result).toHaveLength(1);
      expect(mockCache.delPattern).toHaveBeenCalledWith('experiences:*');
    });

    it('should throw if a required experience is missing', async () => {
      mockPrisma.experience.findMany.mockResolvedValue([]);

      await expect(service.bulkUpdate(['nonexistent'], {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
