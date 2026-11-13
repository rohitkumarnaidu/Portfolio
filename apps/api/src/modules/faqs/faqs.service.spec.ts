import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockFaq = {
  id: 'faq-1',
  question: 'What is this?',
  answer: 'This is a portfolio site',
  category: 'general',
  isVisible: true,
  displayOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  fAQ: {
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

describe('FaqsService', () => {
  let service: FaqsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FaqsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<FaqsService>(FaqsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated FAQs', async () => {
      mockPrisma.fAQ.findMany.mockResolvedValue([mockFaq]);
      mockPrisma.fAQ.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by visible only', async () => {
      mockPrisma.fAQ.findMany.mockResolvedValue([]);
      mockPrisma.fAQ.count.mockResolvedValue(0);

      await service.findAll(true);

      expect(mockPrisma.fAQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isVisible: true }),
        }),
      );
    });

    it('should filter by category', async () => {
      mockPrisma.fAQ.findMany.mockResolvedValue([]);
      mockPrisma.fAQ.count.mockResolvedValue(0);

      await service.findAll(undefined, 'general');

      expect(mockPrisma.fAQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'general' }),
        }),
      );
    });

    it('should search by question or answer', async () => {
      mockPrisma.fAQ.findMany.mockResolvedValue([]);
      mockPrisma.fAQ.count.mockResolvedValue(0);

      await service.findAll(undefined, undefined, { search: 'portfolio' });

      const callArg = mockPrisma.fAQ.findMany.mock.calls[0][0];
      expect(callArg.where.OR).toBeDefined();
      expect(callArg.where.OR).toHaveLength(2);
    });

    it('should return empty when no FAQs', async () => {
      mockPrisma.fAQ.findMany.mockResolvedValue([]);
      mockPrisma.fAQ.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return an FAQ by id', async () => {
      mockPrisma.fAQ.findUnique.mockResolvedValue(mockFaq);

      const result = await service.findById('faq-1');

      expect(result).toEqual(mockFaq);
    });

    it('should throw for non-existent FAQ', async () => {
      mockPrisma.fAQ.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an FAQ', async () => {
      mockPrisma.fAQ.create.mockResolvedValue(mockFaq);

      const result = await service.create({ question: 'What is this?', answer: 'A site' } as any);

      expect(result).toEqual(mockFaq);
    });
  });

  describe('update', () => {
    it('should update existing FAQ', async () => {
      mockPrisma.fAQ.update.mockResolvedValue({ ...mockFaq, question: 'Updated?' });

      const result = await service.update('faq-1', { question: 'Updated?' } as any);

      expect(result.question).toBe('Updated?');
    });

    it('should throw for non-existent FAQ', async () => {
      mockPrisma.fAQ.update.mockRejectedValue(new Error('Record not found'));

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing FAQ', async () => {
      mockPrisma.fAQ.delete.mockResolvedValue(mockFaq);

      await service.delete('faq-1');

      expect(mockPrisma.fAQ.delete).toHaveBeenCalledWith({ where: { id: 'faq-1' } });
    });

    it('should throw for non-existent FAQ', async () => {
      mockPrisma.fAQ.delete.mockRejectedValue(new Error('Not found'));

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should throw NotFoundException', async () => {
      await expect(service.restore('any-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete an FAQ', async () => {
      mockPrisma.fAQ.delete.mockResolvedValue(mockFaq);

      await service.hardDelete('faq-1');

      expect(mockPrisma.fAQ.delete).toHaveBeenCalledWith({ where: { id: 'faq-1' } });
    });

    it('should throw for non-existent FAQ', async () => {
      mockPrisma.fAQ.delete.mockRejectedValue(new Error('Not found'));

      await expect(service.hardDelete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple FAQs', async () => {
      mockPrisma.fAQ.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkDelete(['faq-1', 'faq-2']);

      expect(result.deleted).toBe(2);
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple FAQs', async () => {
      mockPrisma.fAQ.findMany.mockResolvedValue([mockFaq]);
      mockPrisma.fAQ.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.fAQ.findMany.mockResolvedValueOnce([mockFaq]);

      const result = await service.bulkUpdate(['faq-1'], { isVisible: false });

      expect(result).toHaveLength(1);
    });

    it('should throw if an FAQ is missing', async () => {
      mockPrisma.fAQ.findMany.mockResolvedValue([]);

      await expect(service.bulkUpdate(['nonexistent'], {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
