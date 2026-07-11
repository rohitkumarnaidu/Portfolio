import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from '../../modules/analytics/analytics.service';
import { TrackEventDto } from '../../modules/analytics/dto/track-event.dto';

@ApiTags('Portfolio - Analytics')
@Controller('portfolio/analytics')
export class PortfolioAnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('events')
  @ApiOperation({ summary: 'Track an analytics event' })
  trackEvent(@Body() dto: TrackEventDto) {
    return { data: this.analytics.trackEvent(dto) };
  }
}


