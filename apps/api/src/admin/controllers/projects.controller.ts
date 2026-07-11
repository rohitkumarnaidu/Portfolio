import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from '../../modules/projects/projects.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CreateProjectDto, UpdateProjectDto, AddProjectImageDto } from '../../modules/projects/dto';

@ApiTags('Admin - Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/projects')
export class AdminProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get all projects' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  async findAll(@Query('page') page?: string, @Query('perPage') perPage?: string) {
    return this.projects.findAll({ page: page ? +page : 1, perPage: perPage ? +perPage : 50 });
  }

  @Get(':slugOrId')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get project by slug or ID' })
  async findOne(@Param('slugOrId') slugOrId: string) { return { data: await this.projects.findBySlugOrId(slugOrId) }; }

  @Post()
  @Roles('admin', 'editor')
  @Audit({ action: 'create', resource: 'project' })
  @ApiOperation({ summary: 'Create a new project' })
  async create(@Body() dto: CreateProjectDto) { return { data: await this.projects.create(dto) }; }

  @Patch(':id')
  @Roles('admin', 'editor')
  @Audit({ action: 'update', resource: 'project' })
  @ApiOperation({ summary: 'Update a project' })
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) { return { data: await this.projects.update(id, dto) }; }

  @Delete(':id')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'project' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project' })
  async delete(@Param('id') id: string) { await this.projects.delete(id); }

  @Post(':projectId/images')
  @Roles('admin', 'editor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add image to project' })
  async addImage(@Param('projectId') projectId: string, @Body() dto: AddProjectImageDto) {
    return { data: await this.projects.addImage(projectId, dto) };
  }

  @Delete(':projectId/images/:id')
  @Roles('admin', 'editor')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove image from project' })
  async removeImage(@Param('projectId') projectId: string, @Param('id') id: string) {
    await this.projects.removeImage(projectId, id);
  }

  @Post('bulk-delete')
  @Roles('admin')
  @Audit({ action: 'bulk_delete', resource: 'project' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk soft-delete projects' })
  async bulkDelete(@Body('ids') ids: string[]) { return this.projects.bulkDelete(ids); }

  @Post('bulk-update')
  @Roles('admin', 'editor')
  @Audit({ action: 'bulk_update', resource: 'project' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update projects (visibility/featured)' })
  async bulkUpdate(@Body('ids') ids: string[], @Body('data') data: Record<string, unknown>) { return { data: await this.projects.bulkUpdate(ids, data) }; }
}
