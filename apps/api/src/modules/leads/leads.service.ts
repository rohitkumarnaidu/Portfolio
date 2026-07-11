import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { NOTIFICATION_ADAPTER } from '../../common/notifications/notification.module';
import { NotificationAdapter } from '../../common/notifications/notification.interface';
import { paginateQuery } from '../../common/database/pagination.helper';
import { CreateLeadDto, UpdateLeadDto } from './dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_ADAPTER) private readonly notifier: NotificationAdapter,
  ) {}

  async findAll(opts?: { status?: string; source?: string; search?: string; page?: number; perPage?: number }) {
    const where: any = { deletedAt: null };
    if (opts?.status) where.status = opts.status;
    if (opts?.source) where.source = opts.source;
    if (opts?.search) {
      const q = opts.search;
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
      ];
    }
    return paginateQuery(
      (args) => this.prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' }, ...args }),
      () => this.prisma.lead.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findById(id: string) {
    const item = await this.prisma.lead.findUnique({ where: { id } });
    if (!item || item.deletedAt) throw new NotFoundException('Lead not found');
    return item;
  }

  async create(dto: CreateLeadDto) {
    const sanitized = sanitizeStrings(dto);
    const lead = await this.prisma.lead.create({
      data: {
        ...sanitized,
        source: sanitized.source || 'contact_form',
        status: 'new',
        priority: 'normal',
        metadata: sanitized.metadata || {},
      } as any,
    });
    this.notifier.sendNewLeadNotification({
      leadId: lead.id, name: lead.name, email: lead.email,
      phone: lead.phone ?? undefined, company: lead.company ?? undefined, subject: lead.subject ?? undefined,
      message: lead.message, source: lead.source, createdAt: lead.createdAt.toISOString(),
    }).catch((err) => this.logger.error('Notification failed', err));
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead || lead.deletedAt) throw new NotFoundException('Lead not found');
    const sanitized = sanitizeStrings(dto);
    const { note, ...updateData } = sanitized;
    const updated = await this.prisma.lead.update({ where: { id }, data: updateData as any });
    if (updateData.status && updateData.status !== lead.status) {
      this.notifier.sendLeadStatusChanged(id, lead.email, lead.name, updateData.status as string)
        .catch((err) => this.logger.error('Status notification failed', err));
    }
    if (note) {
      await this.prisma.leadNote.create({ data: { leadId: id, content: note as string, authorId: 'admin' } });
    }
    return updated;
  }

  async getNotes(leadId: string) {
    return this.prisma.leadNote.findMany({ where: { leadId }, orderBy: { createdAt: 'desc' } });
  }

  async addNote(leadId: string, note: string, userId: string) {
    return this.prisma.leadNote.create({ data: { leadId, content: sanitizeStrings(note) as string, authorId: userId } });
  }

  async addActivity(leadId: string, action: string, actorId?: string, description?: string, details?: Record<string, unknown>, ipAddress?: string) {
    return this.prisma.leadActivity.create({
      data: { leadId, action, actorId, description, details: (details || {}) as any, ipAddress },
    });
  }

  async delete(id: string) {
    try {
      await this.prisma.lead.update({ where: { id }, data: { deletedAt: new Date() } });
    } catch {
      throw new NotFoundException('Lead not found');
    }
  }

  async restore(id: string) {
    try {
      await this.prisma.lead.update({ where: { id }, data: { deletedAt: null } });
      return await this.findById(id);
    } catch {
      throw new NotFoundException('Lead not found');
    }
  }

  async hardDelete(id: string) {
    try {
      await this.prisma.lead.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Lead not found');
    }
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.lead.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date() } });
    return { deleted: result.count, failed: ids.length - result.count };
  }

  async bulkUpdate(ids: string[], data: Record<string, any>) {
    const leads = await this.prisma.lead.findMany({ where: { id: { in: ids }, deletedAt: null } });
    const foundIds = leads.map((l: { id: string }) => l.id);
    const missing = ids.filter((id) => !foundIds.includes(id));
    if (missing.length) throw new NotFoundException(`Leads ${missing.join(', ')} not found`);
    const { note, ...updateData } = data;
    await this.prisma.lead.updateMany({ where: { id: { in: ids } }, data: updateData as any });
    if (note) {
      await this.prisma.leadNote.createMany({
        data: ids.map((id) => ({ leadId: id, content: note as string, authorId: 'admin' })),
      });
    }
    return this.prisma.lead.findMany({ where: { id: { in: ids } } });
  }

  async getExportData() {
    return this.prisma.lead.findMany({ where: { deletedAt: null } });
  }
}
