import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GuestAppearancesService } from './guest-appearances.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockGuestAppearance = {
  id: 'ga-1',
  title: 'Podcast Episode',
  platform: 'Spotify',
  url: 'https://spotify.com/episode-1',
  date: new Date('2024-03-01'),
  description: 'Interview about tech',
  displayOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  guestAppearance: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('GuestAppearancesService', () => {
  let service: GuestAppearancesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuestAppearancesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<GuestAppearancesService>(GuestAppearancesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated guest appearances', async () => {
      mockPrisma.guestAppearance.findMany.mockResolvedValue([mockGuestAppearance]);
      mockPrisma.guestAppearance.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should return empty when no guest appearances', async () => {
      mockPrisma.guestAppearance.findMany.mockResolvedValue([]);
      mockPrisma.guestAppearance.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return a guest appearance by id', async () => {
      mockPrisma.guestAppearance.findUnique.mockResolvedValue(mockGuestAppearance);

      const result = await service.findById('ga-1');

      expect(result).toEqual(mockGuestAppearance);
    });

    it('should throw for non-existent guest appearance', async () => {
      mockPrisma.guestAppearance.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a guest appearance', async () => {
      mockPrisma.guestAppearance.create.mockResolvedValue(mockGuestAppearance);

      const result = await service.create({ title: 'Podcast Episode' } as any);

      expect(result).toEqual(mockGuestAppearance);
    });
  });

  describe('update', () => {
    it('should update existing guest appearance', async () => {
      mockPrisma.guestAppearance.findUnique.mockResolvedValue(mockGuestAppearance);
      mockPrisma.guestAppearance.update.mockResolvedValue({
        ...mockGuestAppearance,
        title: 'Updated',
      });

      const result = await service.update('ga-1', { title: 'Updated' } as any);

      expect(result.title).toBe('Updated');
    });

    it('should throw for non-existent guest appearance', async () => {
      mockPrisma.guestAppearance.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing guest appearance', async () => {
      mockPrisma.guestAppearance.findUnique.mockResolvedValue(mockGuestAppearance);
      mockPrisma.guestAppearance.delete.mockResolvedValue(mockGuestAppearance);

      await service.delete('ga-1');

      expect(mockPrisma.guestAppearance.delete).toHaveBeenCalledWith({ where: { id: 'ga-1' } });
    });

    it('should throw for non-existent guest appearance', async () => {
      mockPrisma.guestAppearance.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
