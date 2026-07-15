import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { AnalyticsService } from '../../modules/analytics/analytics.service';
import type { TrackEventDto } from '../../modules/analytics/dto/track-event.dto';

@ApiTags('Portfolio - Analytics')
@Controller('portfolio/analytics')
export class PortfolioAnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('events')
  @ApiOperation({ summary: 'Track an analytics event' })
  async trackEvent(@Body() dto: TrackEventDto) {
    return { data: await this.analytics.trackEvent(dto) };
  }
}
