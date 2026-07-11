import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeadsService } from '../../modules/leads/leads.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { UpdateLeadDto } from '../../modules/leads/dto';

const CSV_SAFE_RE = /^[=+\-@\t\r]/;

function escapeCsv(value: string): string {
  if (CSV_SAFE_RE.test(value)) return `'${value}`;
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

@ApiTags('Admin - Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/leads')
export class AdminLeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get all leads' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'source', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  async findAll(@Query('status') status?: string, @Query('source') source?: string, @Query('search') search?: string, @Query('page') page?: string) {
    return this.leads.findAll({ status, source, search, page: page ? +page : 1 });
  }

  @Get('export')
  @Roles('admin', 'editor')
  @ApiOperation({ summary: 'Export leads as CSV' })
  async exportCsv(@Res() res: Response) {
    const leads = await this.leads.getExportData();
    const header = 'name,email,phone,company,subject,status,priority,created_at';
    const rows = leads.map((l: any) => [
      escapeCsv(l.name), escapeCsv(l.email), escapeCsv(l.phone || ''),
      escapeCsv(l.company || ''), escapeCsv(l.subject || ''),
      l.status, l.priority, l.created_at,
    ].join(','));
    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.send(csv);
  }

  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get lead by ID' })
  async findOne(@Param('id') id: string) { return { data: await this.leads.findById(id) }; }

  @Patch(':id')
  @Roles('admin', 'editor')
  @Audit({ action: 'update', resource: 'lead' })
  @ApiOperation({ summary: 'Update lead status/priority' })
  async update(@Param('id') id: string, @Body() dto: UpdateLeadDto) { return { data: await this.leads.update(id, dto) }; }

  @Get(':id/notes')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get lead notes' })
  async getNotes(@Param('id') id: string) { return { data: await this.leads.getNotes(id) }; }

  @Post(':id/notes')
  @Roles('admin', 'editor')
  @Audit({ action: 'add_note', resource: 'lead' })
  @ApiOperation({ summary: 'Add note to lead' })
  async addNote(@Param('id') id: string, @Body('note') note: string) { return { data: await this.leads.addNote(id, note, 'admin') }; }

  @Delete(':id')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'lead' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lead' })
  async delete(@Param('id') id: string) { await this.leads.delete(id); }

  @Post(':id/restore')
  @Roles('admin')
  @Audit({ action: 'restore', resource: 'lead' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted lead' })
  async restore(@Param('id') id: string) { return { data: await this.leads.restore(id) }; }

  @Delete(':id/hard')
  @Roles('admin')
  @Audit({ action: 'hard_delete', resource: 'lead' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a lead' })
  async hardDelete(@Param('id') id: string) { await this.leads.hardDelete(id); }

  @Post('bulk-delete')
  @Roles('admin')
  @Audit({ action: 'bulk_delete', resource: 'lead' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk soft-delete leads' })
  async bulkDelete(@Body('ids') ids: string[]) { return this.leads.bulkDelete(ids); }

  @Post('bulk-update')
  @Roles('admin', 'editor')
  @Audit({ action: 'bulk_update', resource: 'lead' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update leads (status/priority)' })
  async bulkUpdate(@Body('ids') ids: string[], @Body('data') data: Record<string, unknown>) { return { data: await this.leads.bulkUpdate(ids, data) }; }
}
