import { Controller, Post, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { CleanupService } from '../../common/cleanup/cleanup.service';

@ApiTags('Admin - Cleanup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/cleanup')
export class AdminCleanupController {
  private readonly logger = new Logger(AdminCleanupController.name);

  constructor(private readonly cleanup: CleanupService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Run data retention cleanup (deletes old analytics, leads, chat)' })
  async runCleanup() {
    this.logger.log('Cleanup initiated by admin');
    return { data: await this.cleanup.run() };
  }
}
