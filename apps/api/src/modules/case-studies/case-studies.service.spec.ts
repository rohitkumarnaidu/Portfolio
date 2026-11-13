import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CaseStudiesService } from './case-studies.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockCaseStudy = {
  id: 'cs-1',
  projectId: 'project-1',
  challenge: 'Needed to handle 10k concurrent users',
  approach: 'Used microservices architecture',
  solution: 'Built a scalable e-commerce platform',
  impact: '50% increase in sales',
  architectureDiagrams: [],
  codeSnippets: [],
  metrics: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  caseStudy: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('CaseStudiesService', () => {
  let service: CaseStudiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaseStudiesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<CaseStudiesService>(CaseStudiesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated case studies', async () => {
      mockPrisma.caseStudy.findMany.mockResolvedValue([mockCaseStudy]);
      mockPrisma.caseStudy.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by project id', async () => {
      mockPrisma.caseStudy.findMany.mockResolvedValue([]);
      mockPrisma.caseStudy.count.mockResolvedValue(0);

      await service.findAll('project-1');

      expect(mockPrisma.caseStudy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ projectId: 'project-1' }),
        }),
      );
    });

    it('should return empty when no case studies', async () => {
      mockPrisma.caseStudy.findMany.mockResolvedValue([]);
      mockPrisma.caseStudy.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return a case study by id', async () => {
      mockPrisma.caseStudy.findUnique.mockResolvedValue(mockCaseStudy);

      const result = await service.findById('cs-1');

      expect(result).toEqual(mockCaseStudy);
    });

    it('should throw for non-existent case study', async () => {
      mockPrisma.caseStudy.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByProjectId', () => {
    it('should return all case studies for a project', async () => {
      mockPrisma.caseStudy.findMany.mockResolvedValue([mockCaseStudy]);

      const result = await service.findByProjectId('project-1');

      expect(result).toHaveLength(1);
      expect(mockPrisma.caseStudy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { projectId: 'project-1' } }),
      );
    });

    it('should return empty array for project with no case studies', async () => {
      mockPrisma.caseStudy.findMany.mockResolvedValue([]);

      const result = await service.findByProjectId('project-without');

      expect(result).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('should create a case study', async () => {
      mockPrisma.caseStudy.create.mockResolvedValue(mockCaseStudy);

      const result = await service.create({
        title: 'E-commerce Platform',
        projectId: 'project-1',
      } as any);

      expect(result).toEqual(mockCaseStudy);
    });
  });

  describe('update', () => {
    it('should update existing case study', async () => {
      mockPrisma.caseStudy.findUnique.mockResolvedValue(mockCaseStudy);
      mockPrisma.caseStudy.update.mockResolvedValue({
        ...mockCaseStudy,
        challenge: 'Updated challenge',
      });

      const result = await service.update('cs-1', { challenge: 'Updated challenge' } as any);

      expect(result.challenge).toBe('Updated challenge');
    });

    it('should throw for non-existent case study', async () => {
      mockPrisma.caseStudy.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing case study', async () => {
      mockPrisma.caseStudy.findUnique.mockResolvedValue(mockCaseStudy);
      mockPrisma.caseStudy.delete.mockResolvedValue(mockCaseStudy);

      await service.delete('cs-1');

      expect(mockPrisma.caseStudy.delete).toHaveBeenCalledWith({ where: { id: 'cs-1' } });
    });

    it('should throw for non-existent case study', async () => {
      mockPrisma.caseStudy.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
