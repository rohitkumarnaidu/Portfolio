import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { LeadsService } from '../../modules/leads/leads.service';
import type { CreateLeadDto } from '../../modules/leads/dto';

@ApiTags('Portfolio - Leads')
@Controller('portfolio/leads')
export class PortfolioLeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  @ApiOperation({ summary: 'Submit a contact form lead' })
  async create(@Body() dto: CreateLeadDto) {
    return { data: await this.leads.create(dto) };
  }
}
