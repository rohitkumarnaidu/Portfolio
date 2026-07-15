import { Controller, Get, Param, Res, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import type { CsvService } from '../../common/export/csv.service';
import type { PrismaService } from '../../common/database/prisma.service';

type EntityName =
  | 'sections'
  | 'projects'
  | 'blog'
  | 'skills'
  | 'testimonials'
  | 'services'
  | 'faqs'
  | 'experiences'
  | 'leads'
  | 'achievements'
  | 'press-features'
  | 'guest-appearances'
  | 'reading-list'
  | 'users'
  | 'media';

const ENTITY_MODELS: Record<EntityName, string> = {
  sections: 'section',
  projects: 'project',
  blog: 'blogPost',
  skills: 'skill',
  testimonials: 'testimonial',
  services: 'service',
  faqs: 'fAQ',
  experiences: 'experience',
  leads: 'lead',
  achievements: 'achievement',
  'press-features': 'pressFeature',
  'guest-appearances': 'guestAppearance',
  'reading-list': 'readingListItem',
  users: 'user',
  media: 'mediaAsset',
};

@ApiTags('Admin - Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/export')
export class AdminExportController {
  private readonly logger = new Logger(AdminExportController.name);

  constructor(
    private readonly csv: CsvService,
    private readonly prisma: PrismaService,
  ) {}

  @Get(':entity/csv')
  @Roles('admin', 'editor')
  @ApiOperation({ summary: 'Export entity data as CSV' })
  async exportCsv(@Param('entity') entity: EntityName, @Res() res: Response) {
    const modelName = ENTITY_MODELS[entity];
    if (!modelName) {
      res.status(404).json({ error: `Unknown entity: ${entity}` });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, unknown>[] = await (this.prisma as any)[modelName].findMany({
      orderBy: { createdAt: 'desc' },
    });
    const csv = this.csv.toCsv(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${entity}-export.csv"`);
    res.send(csv);
  }
}
