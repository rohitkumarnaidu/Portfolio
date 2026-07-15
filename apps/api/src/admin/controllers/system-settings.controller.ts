import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { SystemSettingsService } from '../../modules/system-settings/system-settings.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { UpsertSystemSettingDto } from '../../modules/system-settings/dto';

@ApiTags('Admin - System Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/settings')
export class AdminSystemSettingsController {
  constructor(private readonly settings: SystemSettingsService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get all settings, optionally filtered by group' })
  @ApiQuery({ name: 'group', required: false })
  async findAll(@Query('group') group?: string) {
    return { data: await this.settings.findAll(group) };
  }

  @Get(':key')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get a single setting by key' })
  async findByKey(@Param('key') key: string) {
    return { data: await this.settings.findByKey(key) };
  }

  @Put(':key')
  @Roles('admin', 'editor')
  @Audit({ action: 'upsert', resource: 'system_setting' })
  @ApiOperation({ summary: 'Create or update a setting' })
  async upsert(@Param('key') key: string, @Body() dto: UpsertSystemSettingDto) {
    return {
      data: await this.settings.upsert(
        key,
        dto.settingValue,
        dto.settingGroup,
        dto.description,
        dto.dataType,
      ),
    };
  }

  @Delete(':key')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'system_setting' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a setting' })
  async delete(@Param('key') key: string) {
    await this.settings.delete(key);
  }
}
