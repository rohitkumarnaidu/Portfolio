import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery } from '../../common/database/pagination.helper';
import { CreateReadingListItemDto, UpdateReadingListItemDto } from './dto';

@Injectable()
export class ReadingListItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string, opts?: { page?: number; perPage?: number }) {
    const where: any = {};
    if (category) where.category = category;
    return paginateQuery(
      (args) => this.prisma.readingListItem.findMany({ where, orderBy: { displayOrder: 'asc' }, ...args }),
      () => this.prisma.readingListItem.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findById(id: string) {
    const item = await this.prisma.readingListItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Reading list item not found');
    return item;
  }

  async create(dto: CreateReadingListItemDto) {
    return this.prisma.readingListItem.create({ data: sanitizeStrings(dto) as any });
  }

  async update(id: string, dto: UpdateReadingListItemDto) {
    const existing = await this.prisma.readingListItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Reading list item not found');
    return this.prisma.readingListItem.update({ where: { id }, data: sanitizeStrings(dto) as any });
  }

  async delete(id: string) {
    const existing = await this.prisma.readingListItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Reading list item not found');
    await this.prisma.readingListItem.delete({ where: { id } });
  }
}
