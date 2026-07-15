import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { NotificationsService } from '../../modules/notifications/notifications.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Admin - Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'List notifications' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'isRead', required: false })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('isRead') isRead?: string,
    @Query('type') type?: string,
  ) {
    return this.notifications.findAll({
      page: page ? +page : 1,
      perPage: perPage ? +perPage : 50,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      type,
    });
  }

  @Get('unread-count')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount() {
    return { data: await this.notifications.getUnreadCount() };
  }

  @Patch(':id/read')
  @Roles('admin', 'editor')
  @Audit({ action: 'mark_read', resource: 'notification' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Param('id') id: string) {
    return { data: await this.notifications.markRead(id) };
  }

  @Patch('read-all')
  @Roles('admin', 'editor')
  @Audit({ action: 'mark_all_read', resource: 'notification' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead() {
    return { data: await this.notifications.markAllRead() };
  }

  @Delete(':id')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'notification' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  async delete(@Param('id') id: string) {
    await this.notifications.delete(id);
  }
}
