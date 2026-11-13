import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Raw } from '../common/decorators/raw.decorator';
import { PrismaService } from '../common/database/prisma.service';

@ApiTags('Health')
@Raw()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Health check alias used by deploy smoke tests' })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('liveness')
  @HttpCode(200)
  @ApiOperation({ summary: 'Liveness probe - is the app alive?' })
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() };
  }

  @Get('readiness')
  @HttpCode(200)
  @ApiOperation({ summary: 'Readiness probe - can the app serve requests?' })
  async readiness() {
    let dbStatus = 'disconnected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }
    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
