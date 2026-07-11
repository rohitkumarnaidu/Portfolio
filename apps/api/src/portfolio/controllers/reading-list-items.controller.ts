import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { ReadingListItemsService } from '../../modules/reading-list-items/reading-list-items.service';

@ApiTags('Portfolio - Reading List Items')
@Controller('portfolio/reading-list-items')
export class PortfolioReadingListItemsController {
  constructor(private readonly service: ReadingListItemsService) {}

  @Get()
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get reading list items, optionally filtered by category' })
  async findAll(@Query('category') category?: string) {
    return this.service.findAll(category);
  }
}
