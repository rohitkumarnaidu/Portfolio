import { Controller, Get, Post, Delete, Param, Body, Query, Res, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from '../../modules/activities/activities.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

const CSV_SAFE_RE = /^[=+\-@\t\r]/;

function escapeCsv(value: string): string {
  if (CSV_SAFE_RE.test(value)) return `'${value}`;
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

@ApiTags('Admin - Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/activities')
export class AdminActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get admin activity log' })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'page', required: false })
  async findAll(@Query('action') action?: string, @Query('resource') resource?: string, @Query('page') page?: string) {
    return this.activities.findAll({ action, resource, page: page ? +page : 1 });
  }

  @Get('stats')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get activity stats' })
  async getStats() { return { data: await this.activities.getStats() }; }

  @Get('export')
  @Roles('admin', 'editor')
  @ApiOperation({ summary: 'Export activities as CSV' })
  async exportCsv(@Res() res: Response) {
    const activities = await this.activities.getCsvData();
    const header = 'action,resource,resource_id,user_id,created_at';
    const rows = activities.map((a: any) => [
      escapeCsv(a.action), escapeCsv(a.resourceType || ''),
      escapeCsv(a.resourceId || ''), escapeCsv(a.adminId || ''),
      a.createdAt,
    ].join(','));
    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="admin-activities.csv"');
    res.send(csv);
  }

  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get activity by ID' })
  async findOne(@Param('id') id: string) { return { data: await this.activities.findById(id) }; }

  @Delete(':id')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'activity' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an activity' })
  async delete(@Param('id') id: string) { await this.activities.delete(id); }

  @Post('bulk-delete')
  @Roles('admin')
  @Audit({ action: 'bulk_delete', resource: 'activity' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk soft-delete activities' })
  async bulkDelete(@Body('ids') ids: string[]) { return this.activities.bulkDelete(ids); }
}
