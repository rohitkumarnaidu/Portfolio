import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { EventsService } from '../../modules/events/events.service';
import type { CreateEventDto } from '../../modules/events/dto';

@ApiTags('Portfolio - Events')
@Controller('portfolio/events')
export class PortfolioEventsController {
  constructor(private readonly events: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Track an analytics event' })
  async track(@Body() dto: CreateEventDto) {
    return { data: await this.events.create(dto) };
  }
}
