import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BlogService } from './blog.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockPost = {
  id: 'post-1',
  slug: 'test-post',
  title: 'Test Blog Post',
  excerpt: 'A short excerpt',
  content: '<p>Full content here</p>',
  coverImage: null as string | null,
  category: 'tech',
  tags: ['typescript', 'nestjs'] as string[],
  authorName: 'Admin',
  readTimeMinutes: 5,
  isPublished: true,
  isFeatured: false,
  seoTitle: null as string | null,
  seoDescription: null as string | null,
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  blogPost: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('BlogService', () => {
  let service: BlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a blog post with auto-generated slug', async () => {
      mockPrisma.blogPost.create.mockResolvedValue({
        ...mockPost,
        slug: 'test-blog-post',
        title: 'Test Blog Post',
      });

      const result = await service.create({ title: 'Test Blog Post', content: 'Hello world', excerpt: 'Short', category: 'tech', authorName: 'Admin' } as any);

      expect(result.slug).toBe('test-blog-post');
      expect(mockPrisma.blogPost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'test-blog-post' }),
        }),
      );
    });

    it('should use provided slug when given', async () => {
      mockPrisma.blogPost.create.mockResolvedValue({ ...mockPost, slug: 'custom-slug' });

      const result = await service.create({ title: 'X', content: 'X', slug: 'custom-slug' } as any);

      expect(result.slug).toBe('custom-slug');
    });
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      mockPrisma.blogPost.findMany.mockResolvedValue([mockPost]);
      mockPrisma.blogPost.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, perPage: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by published posts', async () => {
      mockPrisma.blogPost.findMany.mockResolvedValue([]);
      mockPrisma.blogPost.count.mockResolvedValue(0);

      await service.findAll({ published: true });

      expect(mockPrisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isPublished: true }),
        }),
      );
    });

    it('should filter by category', async () => {
      mockPrisma.blogPost.findMany.mockResolvedValue([]);
      mockPrisma.blogPost.count.mockResolvedValue(0);

      await service.findAll({ category: 'tech' });

      expect(mockPrisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'tech' }),
        }),
      );
    });

    it('should filter by featured', async () => {
      mockPrisma.blogPost.findMany.mockResolvedValue([]);
      mockPrisma.blogPost.count.mockResolvedValue(0);

      await service.findAll({ featured: true });

      expect(mockPrisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isFeatured: true }),
        }),
      );
    });

    it('should use skip/take for pagination', async () => {
      mockPrisma.blogPost.findMany.mockResolvedValue([]);
      mockPrisma.blogPost.count.mockResolvedValue(0);

      await service.findAll({ page: 2, perPage: 5 });

      expect(mockPrisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });
  });

  describe('findBySlugOrId', () => {
    it('should find by id first', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue(mockPost);

      const result = await service.findBySlugOrId('post-1');

      expect(result).toHaveProperty('id', 'post-1');
      expect(mockPrisma.blogPost.findUnique).toHaveBeenCalledWith({ where: { id: 'post-1' } });
    });

    it('should fall back to slug lookup', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue(null);
      mockPrisma.blogPost.findFirst.mockResolvedValue(mockPost);

      const result = await service.findBySlugOrId('test-post');

      expect(result).toHaveProperty('slug', 'test-post');
    });

    it('should return null for non-existent', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue(null);
      mockPrisma.blogPost.findFirst.mockResolvedValue(null);

      const result = await service.findBySlugOrId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing post', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue(mockPost);
      mockPrisma.blogPost.update.mockResolvedValue({ ...mockPost, title: 'Updated' });

      const result = await service.update('post-1', { title: 'Updated' } as any);

      expect(result.title).toBe('Updated');
    });

    it('should throw for non-existent post', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue(null);

      await expect(service.update('post-1', { title: 'X' } as any))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('publish/unpublish', () => {
    it('should publish a post', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue(mockPost);
      mockPrisma.blogPost.update.mockResolvedValue({ ...mockPost, isPublished: true });

      const result = await service.publish('post-1');

      expect(result.isPublished).toBe(true);
      expect(mockPrisma.blogPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isPublished: true,
            publishedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should unpublish a post', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue({ ...mockPost, isPublished: true });
      mockPrisma.blogPost.update.mockResolvedValue({ ...mockPost, isPublished: false });

      const result = await service.unpublish('post-1');

      expect(result.isPublished).toBe(false);
    });

    it('should throw for non-existent post on publish', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue(null);

      await expect(service.publish('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing post', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue(mockPost);
      mockPrisma.blogPost.delete.mockResolvedValue(mockPost);

      await service.delete('post-1');

      expect(mockPrisma.blogPost.delete).toHaveBeenCalledWith({ where: { id: 'post-1' } });
    });

    it('should throw for non-existent post', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple posts', async () => {
      mockPrisma.blogPost.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.bulkDelete(['p1', 'p2', 'p3']);

      expect(result.deleted).toBe(3);
    });
  });
});