import { Controller, Post, Body, Ip, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LeadsService } from '../../modules/leads/leads.service';
import { CreateLeadDto } from '../../modules/leads/dto';

@ApiTags('Portfolio - Leads')
@Controller('portfolio/leads')
export class PortfolioLeadsController {
  private readonly logger = new Logger(PortfolioLeadsController.name);

  constructor(private readonly leads: LeadsService) {}

  @Post()
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @ApiOperation({ summary: 'Submit a contact form lead' })
  async create(@Body() dto: CreateLeadDto, @Ip() ip: string) {
    if (dto.website?.trim()) {
      this.logger.debug('Lead honeypot triggered; payload discarded');
      return { data: { id: 'discarded' } };
    }
    return { data: await this.leads.create(dto, ip) };
  }
}
