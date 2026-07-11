import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TestimonialsService } from '../../modules/testimonials/testimonials.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CreateTestimonialDto, UpdateTestimonialDto } from '../../modules/testimonials/dto';

@ApiTags('Admin - Testimonials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/testimonials')
export class AdminTestimonialsController {
  constructor(private readonly testimonials: TestimonialsService) {}

  @Get() @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get all testimonials' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false }) @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(@Query('page') page?: string, @Query('perPage') perPage?: string, @Query('search') search?: string, @Query('sortBy') sortBy?: string, @Query('sortOrder') sortOrder?: 'asc' | 'desc') {
    return this.testimonials.findAll(undefined, { page: page ? +page : 1, perPage: perPage ? +perPage : 50, search, sortBy, sortOrder });
  }
  @Get(':id') @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get testimonial by ID' }) async findOne(@Param('id') id: string) { return { data: await this.testimonials.findById(id) }; }
  @Post() @Roles('admin', 'editor') @Audit({ action: 'create', resource: 'testimonial' }) @ApiOperation({ summary: 'Create testimonial' }) async create(@Body() dto: CreateTestimonialDto) { return { data: await this.testimonials.create(dto) }; }
  @Patch(':id') @Roles('admin', 'editor') @Audit({ action: 'update', resource: 'testimonial' }) @ApiOperation({ summary: 'Update testimonial' }) async update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) { return { data: await this.testimonials.update(id, dto) }; }
  @Delete(':id') @Roles('admin') @Audit({ action: 'delete', resource: 'testimonial' }) @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete testimonial' }) async delete(@Param('id') id: string) { await this.testimonials.delete(id); }
  @Patch(':id/toggle-visibility') @Roles('admin', 'editor') @Audit({ action: 'toggle_visibility', resource: 'testimonial' }) @ApiOperation({ summary: 'Toggle visibility of a testimonial' }) async toggleVisibility(@Param('id') id: string) { return { data: await this.testimonials.toggleVisibility(id) }; }
  @Post('bulk-delete') @Roles('admin') @Audit({ action: 'bulk_delete', resource: 'testimonial' }) @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Bulk soft-delete testimonials' }) async bulkDelete(@Body('ids') ids: string[]) { return this.testimonials.bulkDelete(ids); }
  @Post('bulk-update') @Roles('admin', 'editor') @Audit({ action: 'bulk_update', resource: 'testimonial' }) @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Bulk update testimonials (visibility)' }) async bulkUpdate(@Body('ids') ids: string[], @Body('data') data: Record<string, unknown>) { return { data: await this.testimonials.bulkUpdate(ids, data) }; }
}
