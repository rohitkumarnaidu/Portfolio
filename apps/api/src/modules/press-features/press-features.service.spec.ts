import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PressFeaturesService } from './press-features.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockPressFeature = {
  id: 'pf-1',
  title: 'Featured in TechCrunch',
  publication: 'TechCrunch',
  url: 'https://techcrunch.com/article',
  date: new Date('2024-06-01'),
  description: 'Article about our product',
  displayOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  pressFeature: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('PressFeaturesService', () => {
  let service: PressFeaturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PressFeaturesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<PressFeaturesService>(PressFeaturesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated press features', async () => {
      mockPrisma.pressFeature.findMany.mockResolvedValue([mockPressFeature]);
      mockPrisma.pressFeature.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should return empty when no press features', async () => {
      mockPrisma.pressFeature.findMany.mockResolvedValue([]);
      mockPrisma.pressFeature.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return a press feature by id', async () => {
      mockPrisma.pressFeature.findUnique.mockResolvedValue(mockPressFeature);

      const result = await service.findById('pf-1');

      expect(result).toEqual(mockPressFeature);
    });

    it('should throw for non-existent press feature', async () => {
      mockPrisma.pressFeature.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a press feature', async () => {
      mockPrisma.pressFeature.create.mockResolvedValue(mockPressFeature);

      const result = await service.create({
        title: 'Featured in TechCrunch',
        publication: 'TechCrunch',
      } as any);

      expect(result).toEqual(mockPressFeature);
    });
  });

  describe('update', () => {
    it('should update existing press feature', async () => {
      mockPrisma.pressFeature.findUnique.mockResolvedValue(mockPressFeature);
      mockPrisma.pressFeature.update.mockResolvedValue({ ...mockPressFeature, title: 'Updated' });

      const result = await service.update('pf-1', { title: 'Updated' } as any);

      expect(result.title).toBe('Updated');
    });

    it('should throw for non-existent press feature', async () => {
      mockPrisma.pressFeature.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing press feature', async () => {
      mockPrisma.pressFeature.findUnique.mockResolvedValue(mockPressFeature);
      mockPrisma.pressFeature.delete.mockResolvedValue(mockPressFeature);

      await service.delete('pf-1');

      expect(mockPrisma.pressFeature.delete).toHaveBeenCalledWith({ where: { id: 'pf-1' } });
    });

    it('should throw for non-existent press feature', async () => {
      mockPrisma.pressFeature.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
