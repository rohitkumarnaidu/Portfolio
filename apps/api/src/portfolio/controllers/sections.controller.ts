import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiNotFoundResponse } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import type { SectionsService } from '../../modules/sections/sections.service';

@ApiTags('Portfolio - Sections')
@Controller('portfolio/sections')
export class PortfolioSectionsController {
  constructor(private readonly sections: SectionsService) {}

  @Get()
  @CacheTTL(60000)
  @ApiOperation({ summary: 'Get all published sections' })
  @ApiQuery({ name: 'type', required: false })
  async findAll(@Query('type') type?: string) {
    return this.sections.findAll(true, type);
  }

  @Get(':idOrKey')
  @CacheTTL(60000)
  @ApiOperation({ summary: 'Get section by ID or key' })
  @ApiNotFoundResponse({ description: 'Section not found' })
  async findOne(@Param('idOrKey') idOrKey: string) {
    const section = await this.sections.findByIdOrKey(idOrKey);
    if (!section) throw new NotFoundException('Section not found');
    return { data: section };
  }
}
