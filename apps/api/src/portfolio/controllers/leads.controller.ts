import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeadsService } from '../../modules/leads/leads.service';
import { CreateLeadDto } from '../../modules/leads/dto';

@ApiTags('Portfolio - Leads')
@Controller('portfolio/leads')
export class PortfolioLeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact form lead' })
  create(@Body() dto: CreateLeadDto) {
    return { data: this.leads.create(dto) };
  }
}


