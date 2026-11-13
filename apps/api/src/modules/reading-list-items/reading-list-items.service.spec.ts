import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReadingListItemsService } from './reading-list-items.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockReadingListItem = {
  id: 'rli-1',
  title: 'Clean Code',
  author: 'Robert C. Martin',
  url: 'https://example.com/clean-code',
  category: 'book',
  notes: null,
  isRead: false,
  displayOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  readingListItem: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ReadingListItemsService', () => {
  let service: ReadingListItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReadingListItemsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ReadingListItemsService>(ReadingListItemsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated reading list items', async () => {
      mockPrisma.readingListItem.findMany.mockResolvedValue([mockReadingListItem]);
      mockPrisma.readingListItem.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by category', async () => {
      mockPrisma.readingListItem.findMany.mockResolvedValue([]);
      mockPrisma.readingListItem.count.mockResolvedValue(0);

      await service.findAll('book');

      expect(mockPrisma.readingListItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'book' }),
        }),
      );
    });

    it('should return empty when no items', async () => {
      mockPrisma.readingListItem.findMany.mockResolvedValue([]);
      mockPrisma.readingListItem.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return a reading list item by id', async () => {
      mockPrisma.readingListItem.findUnique.mockResolvedValue(mockReadingListItem);

      const result = await service.findById('rli-1');

      expect(result).toEqual(mockReadingListItem);
    });

    it('should throw for non-existent item', async () => {
      mockPrisma.readingListItem.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a reading list item', async () => {
      mockPrisma.readingListItem.create.mockResolvedValue(mockReadingListItem);

      const result = await service.create({
        title: 'Clean Code',
        author: 'Robert C. Martin',
      } as any);

      expect(result).toEqual(mockReadingListItem);
    });
  });

  describe('update', () => {
    it('should update existing reading list item', async () => {
      mockPrisma.readingListItem.findUnique.mockResolvedValue(mockReadingListItem);
      mockPrisma.readingListItem.update.mockResolvedValue({
        ...mockReadingListItem,
        title: 'Updated',
      });

      const result = await service.update('rli-1', { title: 'Updated' } as any);

      expect(result.title).toBe('Updated');
    });

    it('should throw for non-existent item', async () => {
      mockPrisma.readingListItem.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing reading list item', async () => {
      mockPrisma.readingListItem.findUnique.mockResolvedValue(mockReadingListItem);
      mockPrisma.readingListItem.delete.mockResolvedValue(mockReadingListItem);

      await service.delete('rli-1');

      expect(mockPrisma.readingListItem.delete).toHaveBeenCalledWith({ where: { id: 'rli-1' } });
    });

    it('should throw for non-existent item', async () => {
      mockPrisma.readingListItem.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
