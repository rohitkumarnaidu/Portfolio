import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import type { ServicesService } from '../../modules/services/services.service';

@ApiTags('Portfolio - Services')
@Controller('portfolio/services')
export class PortfolioServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get all services' })
  async findAll() {
    return this.services.findAll();
  }
}
