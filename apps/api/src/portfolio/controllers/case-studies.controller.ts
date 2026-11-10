import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { CaseStudiesService } from '../../modules/case-studies/case-studies.service';

@ApiTags('Portfolio - Case Studies')
@Controller('portfolio/case-studies')
export class PortfolioCaseStudiesController {
  constructor(private readonly service: CaseStudiesService) {}

  @Get()
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get case studies, optionally by projectId' })
  async findAll(@Query('projectId') projectId?: string) {
    return this.service.findAll(projectId);
  }

  @Get(':id')
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Get case study by ID' })
  async findOne(@Param('id') id: string) {
    return { data: await this.service.findById(id) };
  }
}
