import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReadingListItemsService } from '../../modules/reading-list-items/reading-list-items.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CreateReadingListItemDto, UpdateReadingListItemDto } from '../../modules/reading-list-items/dto';

@ApiTags('Admin - Reading List Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/reading-list-items')
export class AdminReadingListItemsController {
  constructor(private readonly service: ReadingListItemsService) {}

  @Get() @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get all reading list items' })
  @ApiQuery({ name: 'category', required: false }) @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'perPage', required: false })
  async findAll(@Query('category') category?: string, @Query('page') page?: string, @Query('perPage') perPage?: string) {
    return this.service.findAll(category, { page: page ? +page : 1, perPage: perPage ? +perPage : 50 });
  }
  @Get(':id') @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get reading list item by ID' }) async findOne(@Param('id') id: string) { return { data: await this.service.findById(id) }; }
  @Post() @Roles('admin', 'editor') @Audit({ action: 'create', resource: 'reading_list_item' }) @ApiOperation({ summary: 'Create a reading list item' }) async create(@Body() dto: CreateReadingListItemDto) { return { data: await this.service.create(dto) }; }
  @Patch(':id') @Roles('admin', 'editor') @Audit({ action: 'update', resource: 'reading_list_item' }) @ApiOperation({ summary: 'Update a reading list item' }) async update(@Param('id') id: string, @Body() dto: UpdateReadingListItemDto) { return { data: await this.service.update(id, dto) }; }
  @Delete(':id') @Roles('admin') @Audit({ action: 'delete', resource: 'reading_list_item' }) @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete a reading list item' }) async delete(@Param('id') id: string) { await this.service.delete(id); }
}
