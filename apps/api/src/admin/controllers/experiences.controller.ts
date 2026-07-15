import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { ExperiencesService } from '../../modules/experiences/experiences.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { CreateExperienceDto, UpdateExperienceDto } from '../../modules/experiences/dto';

@ApiTags('Admin - Experiences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/experiences')
export class AdminExperiencesController {
  constructor(private readonly experiences: ExperiencesService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get all experiences' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.experiences.findAll(undefined, {
      page: page ? +page : 1,
      perPage: perPage ? +perPage : 50,
      search,
      sortBy,
      sortOrder,
    });
  }
  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get experience by ID' })
  async findOne(@Param('id') id: string) {
    return { data: await this.experiences.findById(id) };
  }
  @Post()
  @Roles('admin', 'editor')
  @Audit({ action: 'create', resource: 'experience' })
  @ApiOperation({ summary: 'Create experience' })
  async create(@Body() dto: CreateExperienceDto) {
    return { data: await this.experiences.create(dto) };
  }
  @Patch(':id')
  @Roles('admin', 'editor')
  @Audit({ action: 'update', resource: 'experience' })
  @ApiOperation({ summary: 'Update experience' })
  async update(@Param('id') id: string, @Body() dto: UpdateExperienceDto) {
    return { data: await this.experiences.update(id, dto) };
  }
  @Delete(':id')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'experience' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete experience' })
  async delete(@Param('id') id: string) {
    await this.experiences.delete(id);
  }
  @Post(':id/restore')
  @Roles('admin')
  @Audit({ action: 'restore', resource: 'experience' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted experience' })
  async restore(@Param('id') id: string) {
    return { data: await this.experiences.restore(id) };
  }
  @Delete(':id/hard')
  @Roles('admin')
  @Audit({ action: 'hard_delete', resource: 'experience' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete an experience' })
  async hardDelete(@Param('id') id: string) {
    await this.experiences.hardDelete(id);
  }
  @Post('bulk-delete')
  @Roles('admin')
  @Audit({ action: 'bulk_delete', resource: 'experience' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk soft-delete experiences' })
  async bulkDelete(@Body('ids') ids: string[]) {
    return this.experiences.bulkDelete(ids);
  }
  @Post('bulk-update')
  @Roles('admin', 'editor')
  @Audit({ action: 'bulk_update', resource: 'experience' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update experiences (visibility)' })
  async bulkUpdate(@Body('ids') ids: string[], @Body('data') data: Record<string, unknown>) {
    return { data: await this.experiences.bulkUpdate(ids, data) };
  }
}
