import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AvailabilityStatusService } from './availability-status.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockStatus = {
  id: 'status-1',
  isAvailable: true,
  statusLabel: 'Available for hire',
  availableUntil: null,
  preferredContact: 'email',
  updatedAt: new Date(),
};

const mockPrisma = {
  availabilityStatus: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('AvailabilityStatusService', () => {
  let service: AvailabilityStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvailabilityStatusService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<AvailabilityStatusService>(AvailabilityStatusService);
    jest.clearAllMocks();
  });

  describe('getStatus', () => {
    it('should return the availability status', async () => {
      mockPrisma.availabilityStatus.findFirst.mockResolvedValue(mockStatus);

      const result = await service.getStatus();

      expect(result).toEqual(mockStatus);
    });

    it('should throw when no status exists', async () => {
      mockPrisma.availabilityStatus.findFirst.mockResolvedValue(null);

      await expect(service.getStatus()).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update existing availability status', async () => {
      mockPrisma.availabilityStatus.findFirst.mockResolvedValue(mockStatus);
      mockPrisma.availabilityStatus.update.mockResolvedValue({
        ...mockStatus,
        statusLabel: 'Busy',
      });

      const result = await service.update({ statusLabel: 'Busy' } as any);

      expect(result.statusLabel).toBe('Busy');
      expect(mockPrisma.availabilityStatus.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'status-1' },
        }),
      );
    });

    it('should create if not existing', async () => {
      mockPrisma.availabilityStatus.findFirst.mockResolvedValue(null);
      mockPrisma.availabilityStatus.create.mockResolvedValue(mockStatus);

      const result = await service.update({ statusLabel: 'Available' } as any);

      expect(result).toEqual(mockStatus);
      expect(mockPrisma.availabilityStatus.create).toHaveBeenCalled();
    });
  });
});
