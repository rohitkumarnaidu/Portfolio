import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { AvailabilityStatusService } from '../../modules/availability-status/availability-status.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { UpdateAvailabilityStatusDto } from '../../modules/availability-status/dto';

@ApiTags('Admin - Availability Status')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/availability-status')
export class AdminAvailabilityStatusController {
  constructor(private readonly service: AvailabilityStatusService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get availability status' })
  async getStatus() {
    return { data: await this.service.getStatus() };
  }

  @Patch()
  @Roles('admin', 'editor')
  @Audit({ action: 'update', resource: 'availability_status' })
  @ApiOperation({ summary: 'Update availability status' })
  async update(@Body() dto: UpdateAvailabilityStatusDto) {
    return { data: await this.service.update(dto) };
  }
}
