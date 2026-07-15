import { Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery } from '../../common/database/pagination.helper';
import type { CreateFaqDto, UpdateFaqDto } from './dto';

@Injectable()
export class FaqsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    visibleOnly?: boolean,
    category?: string,
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
    if (category) where.category = category;
    if (opts?.search) {
      const q = opts.search;
      where.OR = [
        { question: { contains: q, mode: 'insensitive' } },
        { answer: { contains: q, mode: 'insensitive' } },
      ];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};
    if (opts?.sortBy) {
      orderBy[opts.sortBy] = opts.sortOrder || 'asc';
    } else {
      orderBy.displayOrder = 'asc';
    }
    return paginateQuery(
      (args) => this.prisma.fAQ.findMany({ where, orderBy, ...args }),
      () => this.prisma.fAQ.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findById(id: string) {
    const item = await this.prisma.fAQ.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('FAQ not found');
    return item;
  }

  async create(dto: CreateFaqDto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.fAQ.create({ data: sanitizeStrings(dto) as any });
  }

  async update(id: string, dto: UpdateFaqDto) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await this.prisma.fAQ.update({ where: { id }, data: sanitizeStrings(dto) as any });
    } catch {
      throw new NotFoundException('FAQ not found');
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.fAQ.delete({ where: { id } });
    } catch {
      throw new NotFoundException('FAQ not found');
    }
  }

  async restore(id: string) {
    const existing = await this.prisma.fAQ.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('FAQ not found');
    return existing;
  }

  async hardDelete(id: string) {
    try {
      await this.prisma.fAQ.delete({ where: { id } });
    } catch {
      throw new NotFoundException('FAQ not found');
    }
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.fAQ.deleteMany({ where: { id: { in: ids } } });
    return { deleted: result.count, failed: ids.length - result.count };
  }

  async bulkUpdate(ids: string[], data: Record<string, unknown>) {
    const found = await this.prisma.fAQ.findMany({ where: { id: { in: ids } } });
    const foundIds = found.map((i: { id: string }) => i.id);
    const missing = ids.filter((id) => !foundIds.includes(id));
    if (missing.length) throw new NotFoundException(`FAQs ${missing.join(', ')} not found`);
    await this.prisma.fAQ.updateMany({
      where: { id: { in: ids } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: sanitizeStrings(data) as any,
    });
    return this.prisma.fAQ.findMany({
      where: { id: { in: ids } },
      orderBy: { displayOrder: 'asc' },
    });
  }
}
