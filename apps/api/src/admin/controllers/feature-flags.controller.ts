import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { FeatureFlagsService } from '../../modules/feature-flags/feature-flags.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { CreateFeatureFlagDto, UpdateFeatureFlagDto } from '../../modules/feature-flags/dto';

@ApiTags('Admin - Feature Flags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/feature-flags')
export class AdminFeatureFlagsController {
  constructor(private readonly flags: FeatureFlagsService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'List all feature flags' })
  async findAll() {
    return this.flags.findAll();
  }

  @Get(':key')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get a feature flag by key' })
  async findByKey(@Param('key') key: string) {
    return { data: await this.flags.findByKey(key) };
  }

  @Post()
  @Roles('admin')
  @Audit({ action: 'create', resource: 'feature_flag' })
  @ApiOperation({ summary: 'Create a feature flag' })
  async create(@Body() dto: CreateFeatureFlagDto) {
    return { data: await this.flags.create(dto) };
  }

  @Patch(':key')
  @Roles('admin')
  @Audit({ action: 'update', resource: 'feature_flag' })
  @ApiOperation({ summary: 'Update a feature flag' })
  async update(@Param('key') key: string, @Body() dto: UpdateFeatureFlagDto) {
    const flag = await this.flags.findByKey(key);
    return { data: await this.flags.update(flag.id, dto) };
  }

  @Delete(':key')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'feature_flag' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a feature flag' })
  async delete(@Param('key') key: string) {
    await this.flags.delete(key);
  }
}
