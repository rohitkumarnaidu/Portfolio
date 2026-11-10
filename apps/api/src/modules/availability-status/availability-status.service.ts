import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import type { UpdateAvailabilityStatusDto } from './dto';

@Injectable()
export class AvailabilityStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus() {
    const status = await this.prisma.availabilityStatus.findFirst();
    if (status) return status;

    // Nothing has been saved yet. Return the schema defaults so the admin page
    // renders an editable form instead of failing with a 404. The first PATCH
    // persists a real row.
    return {
      id: '',
      isAvailable: true,
      statusLabel: 'Available for new opportunities',
      availableUntil: null,
      preferredContact: 'email',
      updatedAt: new Date().toISOString(),
    };
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
