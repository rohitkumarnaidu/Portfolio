import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { FeatureFlagsService } from '../../modules/feature-flags/feature-flags.service';

@ApiTags('Portfolio - Feature Flags')
@Controller('portfolio/feature-flags')
export class PortfolioFeatureFlagsController {
  constructor(private readonly flags: FeatureFlagsService) {}

  @Get(':key')
  @CacheTTL(60000)
  @ApiOperation({ summary: 'Check if a feature flag is enabled (public)' })
  async isEnabled(@Param('key') key: string) {
    return { data: { flagKey: key, isEnabled: await this.flags.isEnabled(key) } };
  }
}
