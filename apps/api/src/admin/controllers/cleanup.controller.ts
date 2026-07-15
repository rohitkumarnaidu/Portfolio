import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import type { CleanupService } from '../../common/cleanup/cleanup.service';

@ApiTags('Admin - Cleanup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/cleanup')
export class AdminCleanupController {
  constructor(private readonly cleanup: CleanupService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Trigger data cleanup' })
  async run() {
    return { data: await this.cleanup.run() };
  }
}
