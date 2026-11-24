import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { AvailabilityStatusService } from '../../modules/availability-status/availability-status.service';

@ApiTags('Portfolio - Availability Status')
@Controller('portfolio/availability-status')
export class PortfolioAvailabilityStatusController {
  constructor(private readonly service: AvailabilityStatusService) {}

  @Get()
  @CacheTTL(60000)
  @ApiOperation({ summary: 'Get the public availability status' })
  async find() {
    return { data: await this.service.getStatus() };
  }
}
