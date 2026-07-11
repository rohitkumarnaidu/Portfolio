import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { AvailabilityStatusService } from '../../modules/availability-status/availability-status.service';

@ApiTags('Portfolio - Availability Status')
@Controller('portfolio/availability-status')
export class PortfolioAvailabilityStatusController {
  constructor(private readonly service: AvailabilityStatusService) {}

  @Get()
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get availability status' })
  async getStatus() {
    return { data: await this.service.getStatus() };
  }
}
