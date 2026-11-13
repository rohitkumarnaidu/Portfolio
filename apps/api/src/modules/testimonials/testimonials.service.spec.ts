import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockTestimonial = {
  id: 'test-1',
  name: 'Jane Doe',
  company: 'Tech Co',
  role: 'CTO',
  content: 'Amazing work!',
  avatarUrl: null,
  isVisible: true,
  displayOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  testimonial: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('TestimonialsService', () => {
  let service: TestimonialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestimonialsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<TestimonialsService>(TestimonialsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated testimonials', async () => {
      mockPrisma.testimonial.findMany.mockResolvedValue([mockTestimonial]);
      mockPrisma.testimonial.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by visible only', async () => {
      mockPrisma.testimonial.findMany.mockResolvedValue([]);
      mockPrisma.testimonial.count.mockResolvedValue(0);

      await service.findAll(true);

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isVisible: true }),
        }),
      );
    });

    it('should search testimonials', async () => {
      mockPrisma.testimonial.findMany.mockResolvedValue([]);
      mockPrisma.testimonial.count.mockResolvedValue(0);

      await service.findAll(undefined, { search: 'amazing' });

      const callArg = mockPrisma.testimonial.findMany.mock.calls[0][0];
      expect(callArg.where.OR).toBeDefined();
      expect(callArg.where.OR).toHaveLength(3);
    });

    it('should return empty when no testimonials', async () => {
      mockPrisma.testimonial.findMany.mockResolvedValue([]);
      mockPrisma.testimonial.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return a testimonial by id', async () => {
      mockPrisma.testimonial.findUnique.mockResolvedValue(mockTestimonial);

      const result = await service.findById('test-1');

      expect(result).toEqual(mockTestimonial);
    });

    it('should return null for non-existent testimonial', async () => {
      mockPrisma.testimonial.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a testimonial', async () => {
      mockPrisma.testimonial.create.mockResolvedValue(mockTestimonial);

      const result = await service.create({ name: 'Jane Doe', content: 'Great!' } as any);

      expect(result).toEqual(mockTestimonial);
    });
  });

  describe('update', () => {
    it('should update existing testimonial', async () => {
      mockPrisma.testimonial.findUnique.mockResolvedValue(mockTestimonial);
      mockPrisma.testimonial.update.mockResolvedValue({ ...mockTestimonial, content: 'Updated' });

      const result = await service.update('test-1', { content: 'Updated' } as any);

      expect(result.content).toBe('Updated');
    });

    it('should throw for non-existent testimonial', async () => {
      mockPrisma.testimonial.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleVisibility', () => {
    it('should toggle isVisible flag', async () => {
      mockPrisma.testimonial.findUnique.mockResolvedValue(mockTestimonial);
      mockPrisma.testimonial.update.mockResolvedValue({ ...mockTestimonial, isVisible: false });

      const result = await service.toggleVisibility('test-1');

      expect(result.isVisible).toBe(false);
      expect(mockPrisma.testimonial.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'test-1' },
          data: { isVisible: false },
        }),
      );
    });

    it('should throw for non-existent testimonial', async () => {
      mockPrisma.testimonial.findUnique.mockResolvedValue(null);

      await expect(service.toggleVisibility('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing testimonial', async () => {
      mockPrisma.testimonial.findUnique.mockResolvedValue(mockTestimonial);
      mockPrisma.testimonial.delete.mockResolvedValue(mockTestimonial);

      await service.delete('test-1');

      expect(mockPrisma.testimonial.delete).toHaveBeenCalledWith({ where: { id: 'test-1' } });
    });

    it('should throw for non-existent testimonial', async () => {
      mockPrisma.testimonial.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should throw NotFoundException', async () => {
      await expect(service.restore('any-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a testimonial', async () => {
      mockPrisma.testimonial.findUnique.mockResolvedValue(mockTestimonial);
      mockPrisma.testimonial.delete.mockResolvedValue(mockTestimonial);

      await service.hardDelete('test-1');

      expect(mockPrisma.testimonial.delete).toHaveBeenCalledWith({ where: { id: 'test-1' } });
    });

    it('should throw for non-existent testimonial', async () => {
      mockPrisma.testimonial.findUnique.mockResolvedValue(null);

      await expect(service.hardDelete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple testimonials', async () => {
      mockPrisma.testimonial.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkDelete(['test-1', 'test-2']);

      expect(result.deleted).toBe(2);
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple testimonials', async () => {
      mockPrisma.testimonial.findUnique.mockResolvedValue(mockTestimonial);
      mockPrisma.testimonial.update.mockResolvedValue({ ...mockTestimonial, isVisible: false });

      const result = await service.bulkUpdate(['test-1'], { isVisible: false } as any);

      expect(result).toHaveLength(1);
      expect(result[0].isVisible).toBe(false);
    });

    it('should throw if a testimonial is not found', async () => {
      mockPrisma.testimonial.findUnique.mockResolvedValue(null);

      await expect(service.bulkUpdate(['nonexistent'], {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
