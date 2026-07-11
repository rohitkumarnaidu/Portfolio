import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { ExperiencesService } from '../../modules/experiences/experiences.service';

@ApiTags('Portfolio - Experiences')
@Controller('portfolio/experiences')
export class PortfolioExperiencesController {
  constructor(private readonly experiences: ExperiencesService) {}

  @Get()
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get visible work experiences' })
  async findAll() {
    return this.experiences.findAll(true);
  }
}
