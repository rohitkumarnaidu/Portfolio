import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import type { ActivitiesService } from '../../modules/activities/activities.service';

@ApiTags('Admin - Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/activities')
export class AdminActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List admin activities' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'resource', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
  ) {
    return this.activities.findAll({
      action,
      resource,
      page: page ? +page : 1,
      perPage: perPage ? +perPage : 50,
    });
  }
}
