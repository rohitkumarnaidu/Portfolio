import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { paginateQuery } from '../../common/database/pagination.helper';
import { CreateNotificationDto } from './dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts?: { page?: number; perPage?: number; isRead?: boolean; type?: string }) {
    const where: any = {};
    if (opts?.isRead !== undefined) where.isRead = opts.isRead;
    if (opts?.type) where.type = opts.type;
    return paginateQuery(
      (args) => this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, ...args }),
      () => this.prisma.notification.count({ where }),
      opts,
    );
  }

  async findById(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async markRead(id: string) {
    const existing = await this.prisma.notification.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead() {
    await this.prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        type: dto.type,
        title: dto.title,
        body: dto.body,
        channel: dto.channel ?? 'telegram',
        payload: (dto.payload ?? {}) as any,
      },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.notification.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Notification not found');
    await this.prisma.notification.delete({ where: { id } });
  }

  async getUnreadCount() {
    const count = await this.prisma.notification.count({ where: { isRead: false } });
    return { count };
  }
}
