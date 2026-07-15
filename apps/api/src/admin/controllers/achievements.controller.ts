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
import type { AchievementsService } from '../../modules/achievements/achievements.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { CreateAchievementDto, UpdateAchievementDto } from '../../modules/achievements/dto';

@ApiTags('Admin - Achievements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/achievements')
export class AdminAchievementsController {
  constructor(private readonly service: AchievementsService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get all achievements' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  async findAll(
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    return this.service.findAll(category, {
      page: page ? +page : 1,
      perPage: perPage ? +perPage : 50,
    });
  }
  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get achievement by ID' })
  async findOne(@Param('id') id: string) {
    return { data: await this.service.findById(id) };
  }
  @Post()
  @Roles('admin', 'editor')
  @Audit({ action: 'create', resource: 'achievement' })
  @ApiOperation({ summary: 'Create an achievement' })
  async create(@Body() dto: CreateAchievementDto) {
    return { data: await this.service.create(dto) };
  }
  @Patch(':id')
  @Roles('admin', 'editor')
  @Audit({ action: 'update', resource: 'achievement' })
  @ApiOperation({ summary: 'Update an achievement' })
  async update(@Param('id') id: string, @Body() dto: UpdateAchievementDto) {
    return { data: await this.service.update(id, dto) };
  }
  @Delete(':id')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'achievement' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an achievement' })
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
  }
}
