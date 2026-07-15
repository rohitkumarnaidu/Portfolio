import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import type { SkillsService } from '../../modules/skills/skills.service';

@ApiTags('Portfolio - Skills')
@Controller('portfolio/skills')
export class PortfolioSkillsController {
  constructor(private readonly skills: SkillsService) {}

  @Get()
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get skills, optionally filtered by category' })
  async findAll(@Query('category') category?: string) {
    return this.skills.findAll(category);
  }
}
