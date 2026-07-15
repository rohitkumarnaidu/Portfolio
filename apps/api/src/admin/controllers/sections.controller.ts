import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Put,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { SectionsService } from '../../modules/sections/sections.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { RevalidationService } from '../../common/revalidation/revalidation.service';
import type { CreateSectionDto, UpdateSectionDto } from '../../modules/sections/dto';

@ApiTags('Admin - Sections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/sections')
export class AdminSectionsController {
  constructor(
    private readonly sections: SectionsService,
    private readonly revalidation: RevalidationService,
  ) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get all sections (including unpublished)' })
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
    return this.sections.findAll(undefined, undefined, {
      page: page ? +page : 1,
      perPage: perPage ? +perPage : 50,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get section by ID' })
  async findOne(@Param('id') id: string) {
    return { data: await this.sections.findByIdOrKey(id) };
  }

  @Post()
  @Roles('admin', 'editor')
  @Audit({ action: 'create', resource: 'section' })
  @ApiOperation({ summary: 'Create a new section' })
  async create(@Body() dto: CreateSectionDto) {
    const result = await this.sections.create(dto);
    await this.revalidation.revalidate(['sections']);
    return { data: result };
  }

  @Patch(':id')
  @Roles('admin', 'editor')
  @Audit({ action: 'update', resource: 'section' })
  @ApiOperation({ summary: 'Update a section' })
  async update(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    const result = await this.sections.update(id, dto);
    await this.revalidation.revalidate(['sections']);
    return { data: result };
  }

  @Put('reorder')
  @Roles('admin', 'editor')
  @Audit({ action: 'reorder', resource: 'section' })
  @ApiOperation({ summary: 'Batch reorder sections' })
  async reorder(@Body() order: Array<{ id: string; displayOrder: number }>) {
    const result = await this.sections.reorder(order);
    await this.revalidation.revalidate(['sections']);
    return { data: result };
  }

  @Delete(':id')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'section' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a section' })
  async delete(@Param('id') id: string) {
    await this.sections.delete(id);
    await this.revalidation.revalidate(['sections']);
  }

  @Post('bulk-delete')
  @Roles('admin')
  @Audit({ action: 'bulk_delete', resource: 'section' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk soft-delete sections' })
  async bulkDelete(@Body('ids') ids: string[]) {
    const result = await this.sections.bulkDelete(ids);
    await this.revalidation.revalidate(['sections']);
    return result;
  }

  @Post('bulk-update')
  @Roles('admin', 'editor')
  @Audit({ action: 'bulk_update', resource: 'section' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update sections (publish/unpublish)' })
  async bulkUpdate(@Body('ids') ids: string[], @Body('data') data: Record<string, unknown>) {
    const result = await this.sections.bulkUpdate(ids, data);
    await this.revalidation.revalidate(['sections']);
    return { data: result };
  }
}
