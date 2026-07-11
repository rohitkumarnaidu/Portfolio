import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery } from '../../common/database/pagination.helper';
import { CreateFaqDto, UpdateFaqDto } from './dto';

@Injectable()
export class FaqsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(visibleOnly?: boolean, category?: string, opts?: { page?: number; perPage?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
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
    return this.prisma.fAQ.create({ data: sanitizeStrings(dto) as any });
  }

  async update(id: string, dto: UpdateFaqDto) {
    try {
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

  restore(_id: string) {
    throw new NotFoundException('FAQ not found');
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

  async bulkUpdate(ids: string[], data: Record<string, any>) {
    const found = await this.prisma.fAQ.findMany({ where: { id: { in: ids } } });
    const foundIds = found.map((i: { id: string }) => i.id);
    const missing = ids.filter((id) => !foundIds.includes(id));
    if (missing.length) throw new NotFoundException(`FAQs ${missing.join(', ')} not found`);
    await this.prisma.fAQ.updateMany({ where: { id: { in: ids } }, data: sanitizeStrings(data) as any });
    return this.prisma.fAQ.findMany({ where: { id: { in: ids } }, orderBy: { displayOrder: 'asc' } });
  }
}
