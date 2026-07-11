import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { GuestAppearancesService } from '../../modules/guest-appearances/guest-appearances.service';

@ApiTags('Portfolio - Guest Appearances')
@Controller('portfolio/guest-appearances')
export class PortfolioGuestAppearancesController {
  constructor(private readonly service: GuestAppearancesService) {}

  @Get()
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get all guest appearances' })
  async findAll() {
    return this.service.findAll();
  }
}
