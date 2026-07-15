import { Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery } from '../../common/database/pagination.helper';
import type { CreateTestimonialDto, UpdateTestimonialDto } from './dto';

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    visibleOnly?: boolean,
    opts?: {
      page?: number;
      perPage?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (visibleOnly) where.isVisible = true;
    if (opts?.search) {
      const q = opts.search;
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};
    if (opts?.sortBy) {
      orderBy[opts.sortBy] = opts.sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.displayOrder = 'asc';
    }
    return paginateQuery(
      (args) => this.prisma.testimonial.findMany({ where, orderBy, ...args }),
      () => this.prisma.testimonial.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findById(id: string) {
    return this.prisma.testimonial.findUnique({ where: { id } });
  }

  async create(dto: CreateTestimonialDto) {
    return this.prisma.testimonial.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: sanitizeStrings(dto) as any,
    });
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    const existing = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Testimonial not found');
    return this.prisma.testimonial.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: sanitizeStrings(dto) as any,
    });
  }

  async toggleVisibility(id: string) {
    const existing = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Testimonial not found');
    return this.prisma.testimonial.update({
      where: { id },
      data: { isVisible: !existing.isVisible },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Testimonial not found');
    await this.prisma.testimonial.delete({ where: { id } });
  }

  async restore(id: string) {
    const existing = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Testimonial not found');
    return existing;
  }

  async hardDelete(id: string) {
    const existing = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Testimonial not found');
    await this.prisma.testimonial.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.testimonial.deleteMany({ where: { id: { in: ids } } });
    return { deleted: result.count, failed: ids.length - result.count };
  }

  async bulkUpdate(ids: string[], data: Partial<CreateTestimonialDto>) {
    const results = [];
    for (const id of ids) {
      const existing = await this.prisma.testimonial.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException(`Testimonial ${id} not found`);
      const updated = await this.prisma.testimonial.update({
        where: { id },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: sanitizeStrings(data as Record<string, unknown>) as any,
      });
      results.push(updated);
    }
    return results;
  }
}
