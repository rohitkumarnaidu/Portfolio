import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FaqsService } from '../../modules/faqs/faqs.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CreateFaqDto, UpdateFaqDto } from '../../modules/faqs/dto';

@ApiTags('Admin - FAQs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/faqs')
export class AdminFaqsController {
  constructor(private readonly faqs: FaqsService) {}

  @Get() @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get all FAQs' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false }) @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(@Query('page') page?: string, @Query('perPage') perPage?: string, @Query('search') search?: string, @Query('sortBy') sortBy?: string, @Query('sortOrder') sortOrder?: 'asc' | 'desc') {
    return this.faqs.findAll(undefined, undefined, { page: page ? +page : 1, perPage: perPage ? +perPage : 50, search, sortBy, sortOrder });
  }
  @Get(':id') @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get FAQ by ID' }) findOne(@Param('id') id: string) { return { data: this.faqs.findById(id) }; }
  @Post() @Roles('admin', 'editor') @Audit({ action: 'create', resource: 'faq' }) @ApiOperation({ summary: 'Create FAQ' }) create(@Body() dto: CreateFaqDto) { return { data: this.faqs.create(dto) }; }
  @Patch(':id') @Roles('admin', 'editor') @Audit({ action: 'update', resource: 'faq' }) @ApiOperation({ summary: 'Update FAQ' }) update(@Param('id') id: string, @Body() dto: UpdateFaqDto) { return { data: this.faqs.update(id, dto) }; }
  @Delete(':id') @Roles('admin') @Audit({ action: 'delete', resource: 'faq' }) @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete FAQ' }) async delete(@Param('id') id: string) { await this.faqs.delete(id); }
  @Post(':id/restore') @Roles('admin') @Audit({ action: 'restore', resource: 'faq' }) @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Restore a soft-deleted FAQ' }) restore(@Param('id') id: string) { return { data: this.faqs.restore(id) }; }
  @Delete(':id/hard') @Roles('admin') @Audit({ action: 'hard_delete', resource: 'faq' }) @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Permanently delete an FAQ' }) async hardDelete(@Param('id') id: string) { await this.faqs.hardDelete(id); }
  @Post('bulk-delete') @Roles('admin') @Audit({ action: 'bulk_delete', resource: 'faq' }) @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Bulk soft-delete FAQs' }) bulkDelete(@Body('ids') ids: string[]) { return this.faqs.bulkDelete(ids); }
  @Post('bulk-update') @Roles('admin', 'editor') @Audit({ action: 'bulk_update', resource: 'faq' }) @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Bulk update FAQs (visibility)' }) bulkUpdate(@Body('ids') ids: string[], @Body('data') data: Record<string, unknown>) { return { data: this.faqs.bulkUpdate(ids, data) }; }
}
