import { Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery } from '../../common/database/pagination.helper';
import type { CreateGuestAppearanceDto, UpdateGuestAppearanceDto } from './dto';

@Injectable()
export class GuestAppearancesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts?: { page?: number; perPage?: number }) {
    return paginateQuery(
      (args) => this.prisma.guestAppearance.findMany({ orderBy: { displayOrder: 'asc' }, ...args }),
      () => this.prisma.guestAppearance.count(),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findById(id: string) {
    const item = await this.prisma.guestAppearance.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Guest appearance not found');
    return item;
  }

  async create(dto: CreateGuestAppearanceDto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.guestAppearance.create({ data: sanitizeStrings(dto) as any });
  }

  async update(id: string, dto: UpdateGuestAppearanceDto) {
    const existing = await this.prisma.guestAppearance.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Guest appearance not found');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.guestAppearance.update({ where: { id }, data: sanitizeStrings(dto) as any });
  }

  async delete(id: string) {
    const existing = await this.prisma.guestAppearance.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Guest appearance not found');
    await this.prisma.guestAppearance.delete({ where: { id } });
  }
}
