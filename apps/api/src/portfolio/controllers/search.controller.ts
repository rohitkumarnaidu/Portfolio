import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import type { SearchService } from '../../modules/search/search.service';

@ApiTags('Portfolio - Search')
@Controller('portfolio/search')
export class PortfolioSearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @CacheTTL(60000)
  @ApiOperation({ summary: 'Full-text search across projects, blog posts, and case studies' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'type', required: false, enum: ['all', 'projects', 'blog', 'case_studies'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async query(
    @Query('q') q: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.search({
      q,
      type,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }
}
