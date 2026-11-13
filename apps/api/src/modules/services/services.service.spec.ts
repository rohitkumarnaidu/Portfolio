import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockService = {
  id: 'svc-1',
  title: 'Web Development',
  description: 'Building modern web apps',
  icon: 'code-icon',
  isActive: true,
  displayOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  service: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('ServicesService', () => {
  let service: ServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated services', async () => {
      mockPrisma.service.findMany.mockResolvedValue([mockService]);
      mockPrisma.service.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should search by title or description', async () => {
      mockPrisma.service.findMany.mockResolvedValue([]);
      mockPrisma.service.count.mockResolvedValue(0);

      await service.findAll({ search: 'web' });

      const callArg = mockPrisma.service.findMany.mock.calls[0][0];
      expect(callArg.where.OR).toBeDefined();
      expect(callArg.where.OR).toHaveLength(2);
    });

    it('should return empty when no services', async () => {
      mockPrisma.service.findMany.mockResolvedValue([]);
      mockPrisma.service.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return a service by id', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(mockService);

      const result = await service.findById('svc-1');

      expect(result).toEqual(mockService);
    });

    it('should return null for non-existent service', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a service', async () => {
      mockPrisma.service.create.mockResolvedValue(mockService);

      const result = await service.create({ title: 'Web Development' } as any);

      expect(result).toEqual(mockService);
      expect(mockPrisma.service.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Object) }),
      );
    });
  });

  describe('update', () => {
    it('should update existing service', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(mockService);
      mockPrisma.service.update.mockResolvedValue({ ...mockService, title: 'Updated' });

      const result = await service.update('svc-1', { title: 'Updated' } as any);

      expect(result.title).toBe('Updated');
    });

    it('should throw for non-existent service', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing service', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(mockService);
      mockPrisma.service.delete.mockResolvedValue(mockService);

      await service.delete('svc-1');

      expect(mockPrisma.service.delete).toHaveBeenCalledWith({ where: { id: 'svc-1' } });
    });

    it('should throw for non-existent service', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should throw NotFoundException', async () => {
      await expect(service.restore('any-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a service', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(mockService);
      mockPrisma.service.delete.mockResolvedValue(mockService);

      await service.hardDelete('svc-1');

      expect(mockPrisma.service.delete).toHaveBeenCalledWith({ where: { id: 'svc-1' } });
    });

    it('should throw for non-existent service', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(null);

      await expect(service.hardDelete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple services', async () => {
      mockPrisma.service.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkDelete(['svc-1', 'svc-2']);

      expect(result.deleted).toBe(2);
    });
  });
});
