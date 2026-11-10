import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Raw } from '../../common/decorators/raw.decorator';
import { ActivitiesService } from '../../modules/activities/activities.service';

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
  @Roles('admin')
  @ApiOperation({ summary: 'List admin activities' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'resource', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
  ) {
    return this.activities.findAll({
      action,
      resource,
      page: page ? +page : 1,
      perPage: perPage ? +perPage : 50,
    });
  }

  @Get('export')
  @Roles('admin')
  @ApiOperation({ summary: 'Export admin activities as CSV' })
  @Raw()
  async exportCsv(@Res() res: Response) {
    const activities = await this.activities.getCsvData();
    const header = 'id,action,resource_type,resource_id,admin_id,details,created_at';
    const rows = activities.map((activity) =>
      [
        activity.id,
        activity.action,
        activity.resourceType ?? '',
        activity.resourceId ?? '',
        activity.adminId ?? '',
        escapeCsv(JSON.stringify(activity.details ?? {})),
        activity.createdAt.toISOString(),
      ].join(','),
    );
    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="activities.csv"');
    res.send(csv);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get an activity by ID' })
  async findOne(@Param('id') id: string) {
    return { data: await this.activities.findById(id) };
  }
}
