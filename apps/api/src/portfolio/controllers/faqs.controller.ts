import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { FaqsService } from '../../modules/faqs/faqs.service';

@ApiTags('Portfolio - FAQs')
@Controller('portfolio/faqs')
export class PortfolioFaqsController {
  constructor(private readonly faqs: FaqsService) {}

  @Get()
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get visible FAQs' })
  async findAll(@Query('category') category?: string) {
    return this.faqs.findAll(true, category);
  }
}
