import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { BlogService } from '../../modules/blog/blog.service';

@ApiTags('Portfolio - Blog')
@Controller('portfolio/blog')
export class PortfolioBlogController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  @CacheTTL(30000)
  @ApiOperation({ summary: 'Get published blog posts' })
  async findAll(@Query('category') category?: string, @Query('page') page?: string, @Query('perPage') perPage?: string) {
    return this.blog.findAll({ published: true, category, page: page ? +page : 1, perPage: perPage ? +perPage : 20 });
  }

  @Get(':slugOrId')
  @CacheTTL(60000)
  @ApiOperation({ summary: 'Get blog post by slug or ID' })
  @ApiNotFoundResponse({ description: 'Blog post not found' })
  async findOne(@Param('slugOrId') slugOrId: string) {
    const post = await this.blog.findBySlugOrId(slugOrId);
    if (!post) throw new NotFoundException('Blog post not found');
    return { data: post };
  }
}
