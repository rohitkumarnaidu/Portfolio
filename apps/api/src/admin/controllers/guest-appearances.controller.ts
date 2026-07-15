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
import type { GuestAppearancesService } from '../../modules/guest-appearances/guest-appearances.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type {
  CreateGuestAppearanceDto,
  UpdateGuestAppearanceDto,
} from '../../modules/guest-appearances/dto';

@ApiTags('Admin - Guest Appearances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/guest-appearances')
export class AdminGuestAppearancesController {
  constructor(private readonly service: GuestAppearancesService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get all guest appearances' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  async findAll(@Query('page') page?: string, @Query('perPage') perPage?: string) {
    return this.service.findAll({ page: page ? +page : 1, perPage: perPage ? +perPage : 50 });
  }
  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get guest appearance by ID' })
  async findOne(@Param('id') id: string) {
    return { data: await this.service.findById(id) };
  }
  @Post()
  @Roles('admin', 'editor')
  @Audit({ action: 'create', resource: 'guest_appearance' })
  @ApiOperation({ summary: 'Create a guest appearance' })
  async create(@Body() dto: CreateGuestAppearanceDto) {
    return { data: await this.service.create(dto) };
  }
  @Patch(':id')
  @Roles('admin', 'editor')
  @Audit({ action: 'update', resource: 'guest_appearance' })
  @ApiOperation({ summary: 'Update a guest appearance' })
  async update(@Param('id') id: string, @Body() dto: UpdateGuestAppearanceDto) {
    return { data: await this.service.update(id, dto) };
  }
  @Delete(':id')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'guest_appearance' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a guest appearance' })
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
  }
}
