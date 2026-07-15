import { Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery } from '../../common/database/pagination.helper';
import type { CreateServiceDto, UpdateServiceDto } from './dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts?: {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (opts?.search) {
      const q = opts.search;
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
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
      (args) => this.prisma.service.findMany({ where, orderBy, ...args }),
      () => this.prisma.service.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findById(id: string) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: sanitizeStrings(dto) as any,
    });
  }

  async update(id: string, dto: UpdateServiceDto) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service not found');
    return this.prisma.service.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: sanitizeStrings(dto) as any,
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service not found');
    await this.prisma.service.delete({ where: { id } });
  }

  async restore(id: string) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service not found');
    return existing;
  }

  async hardDelete(id: string) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service not found');
    await this.prisma.service.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.service.deleteMany({ where: { id: { in: ids } } });
    return { deleted: result.count, failed: ids.length - result.count };
  }
}
