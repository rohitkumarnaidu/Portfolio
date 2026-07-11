import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiNotFoundResponse } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { ProjectsService } from '../../modules/projects/projects.service';

@ApiTags('Portfolio - Projects')
@Controller('portfolio/projects')
export class PortfolioProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  @CacheTTL(60000)
  @ApiOperation({ summary: 'Get published projects' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'featured', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  async findAll(@Query('category') category?: string, @Query('featured') featured?: string, @Query('page') page?: string, @Query('perPage') perPage?: string) {
    return this.projects.findAll({ category, featured: featured === 'true', page: page ? +page : 1, perPage: perPage ? +perPage : 20 });
  }

  @Get(':slugOrId')
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get project by slug or ID' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async findOne(@Param('slugOrId') slugOrId: string) {
    const project = await this.projects.findBySlugOrId(slugOrId);
    if (!project) throw new NotFoundException('Project not found');
    return { data: project };
  }
}
