import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { AnalyticsService } from '../../modules/analytics/analytics.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';

@ApiTags('Admin - Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('summary')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get analytics summary' })
  @ApiQuery({ name: 'period', required: false, enum: ['24h', '7d', '30d', '90d'] })
  async getSummary(@Query('period') period?: string) {
    return { data: await this.analytics.getSummary(period) };
  }

  @Get('sessions')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get analytics sessions' })
  @ApiQuery({ name: 'page', required: false })
  async getSessions(@Query('page') page?: string) {
    return this.analytics.getSessions({ page: page ? +page : 1 });
  }

  @Get('page-views')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get page views with pagination' })
  async getPageViews(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.analytics.getPageViews({
      page: page ? +page : 1,
      perPage: perPage ? +perPage : 50,
      sessionId,
    });
  }
}
