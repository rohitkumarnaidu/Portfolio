import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import type { TestimonialsService } from '../../modules/testimonials/testimonials.service';

@ApiTags('Portfolio - Testimonials')
@Controller('portfolio/testimonials')
export class PortfolioTestimonialsController {
  constructor(private readonly testimonials: TestimonialsService) {}

  @Get()
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get visible testimonials' })
  async findAll() {
    return this.testimonials.findAll(true);
  }
}
