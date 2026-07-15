import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginate, generateSlug } from '../../common/database/pagination.helper';
import type { CreateProjectDto, UpdateProjectDto, AddProjectImageDto } from './dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts?: {
    category?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    perPage?: number;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (opts?.category) where.category = opts.category;
    if (opts?.featured) where.isFeatured = true;
    if (opts?.search) {
      const q = opts.search;
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    const items = await this.prisma.project.findMany({ where, orderBy: { displayOrder: 'asc' } });
    return paginate(items, { page: opts?.page, perPage: opts?.perPage });
  }

  async findBySlugOrId(slugOrId: string) {
    return this.prisma.project.findFirst({
      where: { OR: [{ id: slugOrId }, { slug: slugOrId }] },
    });
  }

  async create(dto: CreateProjectDto) {
    const sanitized = sanitizeStrings(dto);
    const slug = sanitized.slug || generateSlug(sanitized.title);
    return this.prisma.project.create({
      data: {
        ...sanitized,
        slug,
        content: sanitized.content ?? {},
        metrics: sanitized.metrics ?? {},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');
    const sanitized = sanitizeStrings(dto);
    const slug = sanitized.title ? generateSlug(sanitized.title) : existing.slug;
    return this.prisma.project.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { ...sanitized, slug } as any,
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');
    await this.prisma.project.delete({ where: { id } });
    return true;
  }

  async addImage(projectId: string, dto: AddProjectImageDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.projectImage.create({ data: { projectId, ...dto } as any });
  }

  async removeImage(projectId: string, imageId: string) {
    const image = await this.prisma.projectImage.findUnique({ where: { id: imageId } });
    if (!image || image.projectId !== projectId) throw new NotFoundException('Image not found');
    await this.prisma.projectImage.delete({ where: { id: imageId } });
  }

  async restore(id: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');
    return existing;
  }

  async hardDelete(id: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');
    await this.prisma.project.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.project.deleteMany({ where: { id: { in: ids } } });
    return { deleted: result.count, failed: ids.length - result.count };
  }

  async bulkUpdate(ids: string[], data: Partial<CreateProjectDto>) {
    const results = [];
    for (const id of ids) {
      const existing = await this.prisma.project.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException(`Project ${id} not found`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sanitized = sanitizeStrings(data as any);
      const slug = sanitized.title ? generateSlug(sanitized.title) : existing.slug;
      const updated = await this.prisma.project.update({
        where: { id },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { ...sanitized, slug } as any,
      });
      results.push(updated);
    }
    return results;
  }
}
