import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MediaService } from './media.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockMediaAsset = {
  id: 'media-1',
  filename: 'image.png',
  originalName: 'image.png',
  mimeType: 'image/png',
  size: 1024,
  url: 'https://example.com/uploads/image.png',
  uploadedBy: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  mediaAsset: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<MediaService>(MediaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated media assets', async () => {
      mockPrisma.mediaAsset.findMany.mockResolvedValue([mockMediaAsset]);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by mime type', async () => {
      mockPrisma.mediaAsset.findMany.mockResolvedValue([]);

      await service.findAll({ mimeType: 'image' });

      expect(mockPrisma.mediaAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ mimeType: { contains: 'image', mode: 'insensitive' } }),
        }),
      );
    });

    it('should return empty when no assets', async () => {
      mockPrisma.mediaAsset.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return a media asset by id', async () => {
      mockPrisma.mediaAsset.findUnique.mockResolvedValue(mockMediaAsset);

      const result = await service.findById('media-1');

      expect(result).toEqual(mockMediaAsset);
    });

    it('should throw for non-existent media asset', async () => {
      mockPrisma.mediaAsset.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a media asset', async () => {
      mockPrisma.mediaAsset.create.mockResolvedValue(mockMediaAsset);

      const result = await service.create({
        url: 'https://example.com/file.png',
        filename: 'file.png',
        mimeType: 'image/png',
        size: 512,
      } as any);

      expect(result).toEqual(mockMediaAsset);
    });

    it('should store uploadedBy when provided', async () => {
      mockPrisma.mediaAsset.create.mockResolvedValue(mockMediaAsset);

      await service.create({ url: 'https://example.com/file.png', uploadedBy: 'user-1' } as any);

      expect(mockPrisma.mediaAsset.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ uploadedBy: 'user-1' }),
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete existing media asset', async () => {
      mockPrisma.mediaAsset.findUnique.mockResolvedValue(mockMediaAsset);
      mockPrisma.mediaAsset.delete.mockResolvedValue(mockMediaAsset);

      await service.delete('media-1');

      expect(mockPrisma.mediaAsset.delete).toHaveBeenCalledWith({ where: { id: 'media-1' } });
    });

    it('should throw for non-existent media asset', async () => {
      mockPrisma.mediaAsset.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
