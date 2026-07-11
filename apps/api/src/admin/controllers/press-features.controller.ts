import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PressFeaturesService } from '../../modules/press-features/press-features.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CreatePressFeatureDto, UpdatePressFeatureDto } from '../../modules/press-features/dto';

@ApiTags('Admin - Press Features')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/press-features')
export class AdminPressFeaturesController {
  constructor(private readonly service: PressFeaturesService) {}

  @Get() @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get all press features' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'perPage', required: false })
  async findAll(@Query('page') page?: string, @Query('perPage') perPage?: string) {
    return this.service.findAll({ page: page ? +page : 1, perPage: perPage ? +perPage : 50 });
  }
  @Get(':id') @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get press feature by ID' }) async findOne(@Param('id') id: string) { return { data: await this.service.findById(id) }; }
  @Post() @Roles('admin', 'editor') @Audit({ action: 'create', resource: 'press_feature' }) @ApiOperation({ summary: 'Create a press feature' }) async create(@Body() dto: CreatePressFeatureDto) { return { data: await this.service.create(dto) }; }
  @Patch(':id') @Roles('admin', 'editor') @Audit({ action: 'update', resource: 'press_feature' }) @ApiOperation({ summary: 'Update a press feature' }) async update(@Param('id') id: string, @Body() dto: UpdatePressFeatureDto) { return { data: await this.service.update(id, dto) }; }
  @Delete(':id') @Roles('admin') @Audit({ action: 'delete', resource: 'press_feature' }) @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete a press feature' }) async delete(@Param('id') id: string) { await this.service.delete(id); }
}
