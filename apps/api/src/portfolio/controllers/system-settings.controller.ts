import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import type { SystemSettingsService } from '../../modules/system-settings/system-settings.service';

@ApiTags('Portfolio - System Settings')
@Controller('portfolio/settings')
export class PortfolioSystemSettingsController {
  constructor(private readonly settings: SystemSettingsService) {}

  @Get()
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get public settings, optionally filtered by group' })
  @ApiQuery({ name: 'group', required: false })
  async findAll(@Query('group') group?: string) {
    return { data: await this.settings.findAll(group) };
  }

  @Get(':key')
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get a single setting by key' })
  async findByKey(@Param('key') key: string) {
    return { data: await this.settings.findByKey(key) };
  }
}
