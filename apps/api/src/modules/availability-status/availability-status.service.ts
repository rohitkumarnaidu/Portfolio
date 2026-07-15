import { Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import type { UpdateAvailabilityStatusDto } from './dto';

@Injectable()
export class AvailabilityStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus() {
    const status = await this.prisma.availabilityStatus.findFirst();
    if (!status) throw new NotFoundException('Availability status not found');
    return status;
  }

  async update(dto: UpdateAvailabilityStatusDto) {
    const existing = await this.prisma.availabilityStatus.findFirst();
    if (!existing) {
      return this.prisma.availabilityStatus.create({
        data: sanitizeStrings(dto) as Record<string, unknown>,
      });
    }
    return this.prisma.availabilityStatus.update({
      where: { id: existing.id },
      data: sanitizeStrings(dto) as Record<string, unknown>,
    });
  }
}
