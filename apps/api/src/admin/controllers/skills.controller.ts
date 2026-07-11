import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SkillsService } from '../../modules/skills/skills.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CreateSkillDto, UpdateSkillDto } from '../../modules/skills/dto';

@ApiTags('Admin - Skills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/skills')
export class AdminSkillsController {
  constructor(private readonly skills: SkillsService) {}

  @Get() @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get all skills' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false }) @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(@Query('page') page?: string, @Query('perPage') perPage?: string, @Query('search') search?: string, @Query('sortBy') sortBy?: string, @Query('sortOrder') sortOrder?: 'asc' | 'desc') {
    return this.skills.findAll(undefined, { page: page ? +page : 1, perPage: perPage ? +perPage : 50, search, sortBy, sortOrder });
  }
  @Get(':id') @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get skill by ID' }) async findOne(@Param('id') id: string) { return { data: await this.skills.findById(id) }; }
  @Post() @Roles('admin', 'editor') @Audit({ action: 'create', resource: 'skill' }) @ApiOperation({ summary: 'Create a skill' }) async create(@Body() dto: CreateSkillDto) { return { data: await this.skills.create(dto) }; }
  @Patch(':id') @Roles('admin', 'editor') @Audit({ action: 'update', resource: 'skill' }) @ApiOperation({ summary: 'Update a skill' }) async update(@Param('id') id: string, @Body() dto: UpdateSkillDto) { return { data: await this.skills.update(id, dto) }; }
  @Delete(':id') @Roles('admin') @Audit({ action: 'delete', resource: 'skill' }) @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete a skill' }) async delete(@Param('id') id: string) { await this.skills.delete(id); }
  @Patch(':id/toggle-featured') @Roles('admin', 'editor') @Audit({ action: 'toggle_featured', resource: 'skill' }) @ApiOperation({ summary: 'Toggle featured status of a skill' }) async toggleFeatured(@Param('id') id: string) { return { data: await this.skills.toggleFeatured(id) }; }
  @Post('bulk-delete') @Roles('admin') @Audit({ action: 'bulk_delete', resource: 'skill' }) @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Bulk soft-delete skills' }) async bulkDelete(@Body('ids') ids: string[]) { return this.skills.bulkDelete(ids); }
}
