import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { PressFeaturesService } from '../../modules/press-features/press-features.service';

@ApiTags('Portfolio - Press Features')
@Controller('portfolio/press-features')
export class PortfolioPressFeaturesController {
  constructor(private readonly service: PressFeaturesService) {}

  @Get()
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get all press features' })
  async findAll() {
    return this.service.findAll();
  }
}
