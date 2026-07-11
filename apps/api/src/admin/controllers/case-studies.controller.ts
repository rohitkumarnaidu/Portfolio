import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CaseStudiesService } from '../../modules/case-studies/case-studies.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CreateCaseStudyDto, UpdateCaseStudyDto } from '../../modules/case-studies/dto';

@ApiTags('Admin - Case Studies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/case-studies')
export class AdminCaseStudiesController {
  constructor(private readonly service: CaseStudiesService) {}

  @Get() @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get all case studies' })
  @ApiQuery({ name: 'projectId', required: false }) @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'perPage', required: false })
  async findAll(@Query('projectId') projectId?: string, @Query('page') page?: string, @Query('perPage') perPage?: string) {
    return this.service.findAll(projectId, { page: page ? +page : 1, perPage: perPage ? +perPage : 50 });
  }
  @Get(':id') @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get case study by ID' }) async findOne(@Param('id') id: string) { return { data: await this.service.findById(id) }; }
  @Post() @Roles('admin', 'editor') @Audit({ action: 'create', resource: 'case_study' }) @ApiOperation({ summary: 'Create a case study' }) async create(@Body() dto: CreateCaseStudyDto) { return { data: await this.service.create(dto) }; }
  @Patch(':id') @Roles('admin', 'editor') @Audit({ action: 'update', resource: 'case_study' }) @ApiOperation({ summary: 'Update a case study' }) async update(@Param('id') id: string, @Body() dto: UpdateCaseStudyDto) { return { data: await this.service.update(id, dto) }; }
  @Delete(':id') @Roles('admin') @Audit({ action: 'delete', resource: 'case_study' }) @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete a case study' }) async delete(@Param('id') id: string) { await this.service.delete(id); }
}
