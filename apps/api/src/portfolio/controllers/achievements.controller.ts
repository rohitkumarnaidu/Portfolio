import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { AchievementsService } from '../../modules/achievements/achievements.service';

@ApiTags('Portfolio - Achievements')
@Controller('portfolio/achievements')
export class PortfolioAchievementsController {
  constructor(private readonly service: AchievementsService) {}

  @Get()
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get achievements, optionally filtered by category' })
  async findAll(@Query('category') category?: string) {
    return this.service.findAll(category);
  }
}
