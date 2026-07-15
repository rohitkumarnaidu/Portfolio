import { Controller, Get, Param, Query, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { EventsService } from '../../modules/events/events.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';

@ApiTags('Admin - Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/events')
export class AdminEventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get analytics events' })
  @ApiQuery({ name: 'eventName', required: false })
  @ApiQuery({ name: 'sessionId', required: false })
  @ApiQuery({ name: 'visitorId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  async findAll(
    @Query('eventName') eventName?: string,
    @Query('sessionId') sessionId?: string,
    @Query('visitorId') visitorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    return this.events.findAll({
      eventName,
      sessionId,
      visitorId,
      startDate,
      endDate,
      page: page ? +page : 1,
      perPage: perPage ? +perPage : 20,
    });
  }

  @Get('types')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get distinct event names' })
  async getEventTypes() {
    return { data: await this.events.getDistinctEventNames() };
  }

  @Get('counts')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get event counts by type' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getEventCounts(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return { data: await this.events.getEventCountByType({ startDate, endDate }) };
  }

  @Get('audit-logs')
  @Roles('admin', 'viewer')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({ name: 'tableName', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'actorId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  async getAuditLogs(
    @Query('tableName') tableName?: string,
    @Query('action') action?: string,
    @Query('actorId') actorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
  ) {
    return this.events.queryAuditLogs({
      tableName,
      action,
      actorId,
      startDate,
      endDate,
      page: page ? +page : 1,
    });
  }

  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get event by ID' })
  async findOne(@Param('id') id: string) {
    return { data: await this.events.findById(id) };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an event' })
  async delete(@Param('id') id: string) {
    await this.events.delete(id);
  }
}
