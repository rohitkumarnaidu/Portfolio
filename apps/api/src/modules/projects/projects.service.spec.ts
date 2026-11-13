import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockProject = {
  id: 'project-1',
  slug: 'my-project',
  title: 'My Project',
  description: 'A cool project',
  category: 'web',
  isFeatured: false,
  displayOrder: 1,
  content: {},
  metrics: {},
  technologies: [],
  links: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProjectImage = {
  id: 'img-1',
  projectId: 'project-1',
  url: 'https://example.com/image.png',
  alt: 'Screenshot',
  displayOrder: 1,
  createdAt: new Date(),
};

const mockPrisma = {
  project: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  projectImage: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated projects', async () => {
      mockPrisma.project.findMany.mockResolvedValue([mockProject]);

      const result = await service.findAll({ page: 1, perPage: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by category', async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);

      await service.findAll({ category: 'web' });

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'web' }),
        }),
      );
    });

    it('should filter by featured', async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);

      await service.findAll({ featured: true });

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isFeatured: true }),
        }),
      );
    });

    it('should search by title or description', async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);

      await service.findAll({ search: 'cool' });

      const callArg = mockPrisma.project.findMany.mock.calls[0][0];
      expect(callArg.where.OR).toBeDefined();
      expect(callArg.where.OR).toHaveLength(2);
    });

    it('should return empty array when no projects', async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findBySlugOrId', () => {
    it('should find project by id', async () => {
      mockPrisma.project.findFirst.mockResolvedValue(mockProject);

      const result = await service.findBySlugOrId('project-1');

      expect(result).toHaveProperty('id', 'project-1');
    });

    it('should find project by slug', async () => {
      mockPrisma.project.findFirst.mockResolvedValue(mockProject);

      const result = await service.findBySlugOrId('my-project');

      expect(result).toHaveProperty('slug', 'my-project');
    });

    it('should return null for non-existent project', async () => {
      mockPrisma.project.findFirst.mockResolvedValue(null);

      const result = await service.findBySlugOrId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a project with auto-generated slug', async () => {
      mockPrisma.project.create.mockResolvedValue(mockProject);

      const result = await service.create({ title: 'My Project' } as any);

      expect(result).toHaveProperty('slug');
      expect(mockPrisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'my-project' }),
        }),
      );
    });

    it('should use provided slug when given', async () => {
      mockPrisma.project.create.mockResolvedValue({ ...mockProject, slug: 'custom' });

      const result = await service.create({ title: 'My Project', slug: 'custom' } as any);

      expect(result.slug).toBe('custom');
    });
  });

  describe('update', () => {
    it('should update existing project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.project.update.mockResolvedValue({ ...mockProject, title: 'Updated' });

      const result = await service.update('project-1', { title: 'Updated' } as any);

      expect(result.title).toBe('Updated');
    });

    it('should throw for non-existent project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.update('project-1', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.project.delete.mockResolvedValue(mockProject);

      const result = await service.delete('project-1');

      expect(result).toBe(true);
      expect(mockPrisma.project.delete).toHaveBeenCalledWith({ where: { id: 'project-1' } });
    });

    it('should throw for non-existent project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addImage', () => {
    it('should add image to existing project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.projectImage.create.mockResolvedValue(mockProjectImage);

      const result = await service.addImage('project-1', {
        url: 'https://example.com/image.png',
      } as any);

      expect(result).toHaveProperty('id', 'img-1');
    });

    it('should throw when adding image to non-existent project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.addImage('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeImage', () => {
    it('should remove image from project', async () => {
      mockPrisma.projectImage.findUnique.mockResolvedValue(mockProjectImage);

      await service.removeImage('project-1', 'img-1');

      expect(mockPrisma.projectImage.delete).toHaveBeenCalledWith({ where: { id: 'img-1' } });
    });

    it('should throw if image does not belong to project', async () => {
      mockPrisma.projectImage.findUnique.mockResolvedValue({
        ...mockProjectImage,
        projectId: 'other-project',
      });

      await expect(service.removeImage('project-1', 'img-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw for non-existent image', async () => {
      mockPrisma.projectImage.findUnique.mockResolvedValue(null);

      await expect(service.removeImage('project-1', 'img-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.project.delete.mockResolvedValue(mockProject);

      await service.hardDelete('project-1');

      expect(mockPrisma.project.delete).toHaveBeenCalledWith({ where: { id: 'project-1' } });
    });

    it('should throw for non-existent project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.hardDelete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should throw NotFoundException as restore is not supported', async () => {
      await expect(service.restore('any-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple projects', async () => {
      mockPrisma.project.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkDelete(['project-1', 'project-2']);

      expect(result.deleted).toBe(2);
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple projects', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.project.update.mockResolvedValue({ ...mockProject, category: 'updated' });

      const result = await service.bulkUpdate(['project-1'], { category: 'updated' } as any);

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('updated');
    });

    it('should throw if a project in bulk update is not found', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.bulkUpdate(['nonexistent'], {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
