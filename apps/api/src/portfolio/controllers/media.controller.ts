import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import type { MediaService } from '../../modules/media/media.service';

@ApiTags('Portfolio - Media')
@Controller('portfolio/media')
export class PortfolioMediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get public media assets' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'mimeType', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('mimeType') mimeType?: string,
  ) {
    return this.media.findAll({
      page: page ? +page : undefined,
      perPage: perPage ? +perPage : undefined,
      mimeType,
    });
  }

  @Get(':id')
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get media asset by ID' })
  async findOne(@Param('id') id: string) {
    return { data: await this.media.findById(id) };
  }
}
