import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery } from '../../common/database/pagination.helper';
import { CreateCaseStudyDto, UpdateCaseStudyDto } from './dto';

@Injectable()
export class CaseStudiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId?: string, opts?: { page?: number; perPage?: number }) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    return paginateQuery(
      (args) => this.prisma.caseStudy.findMany({ where, orderBy: { createdAt: 'desc' }, ...args }),
      () => this.prisma.caseStudy.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findById(id: string) {
    const item = await this.prisma.caseStudy.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Case study not found');
    return item;
  }

  async findByProjectId(projectId: string) {
    return this.prisma.caseStudy.findMany({ where: { projectId } });
  }

  async create(dto: CreateCaseStudyDto) {
    return this.prisma.caseStudy.create({ data: sanitizeStrings(dto) as any });
  }

  async update(id: string, dto: UpdateCaseStudyDto) {
    const existing = await this.prisma.caseStudy.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Case study not found');
    return this.prisma.caseStudy.update({ where: { id }, data: sanitizeStrings(dto) as any });
  }

  async delete(id: string) {
    const existing = await this.prisma.caseStudy.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Case study not found');
    await this.prisma.caseStudy.delete({ where: { id } });
  }
}
