import { Module } from '@nestjs/common';
import { SectionsModule } from '../modules/sections/sections.module';
import { ProjectsModule } from '../modules/projects/projects.module';
import { BlogModule } from '../modules/blog/blog.module';
import { LeadsModule } from '../modules/leads/leads.module';
import { CaseStudiesModule } from '../modules/case-studies/case-studies.module';
import { AvailabilityStatusModule } from '../modules/availability-status/availability-status.module';
import { PortfolioSectionsController } from './controllers/sections.controller';
import { PortfolioProjectsController } from './controllers/projects.controller';
import { PortfolioBlogController } from './controllers/blog.controller';
import { PortfolioLeadsController } from './controllers/leads.controller';
import { PortfolioCaseStudiesController } from './controllers/case-studies.controller';
import { PortfolioAvailabilityStatusController } from './controllers/availability-status.controller';

/**
 * Public, read-only surface. Only the endpoints the public site actually
 * consumes are exposed here; admin CRUD lives in AdminModule.
 */
@Module({
  imports: [
    SectionsModule,
    ProjectsModule,
    BlogModule,
    LeadsModule,
    CaseStudiesModule,
    AvailabilityStatusModule,
  ],
  controllers: [
    PortfolioSectionsController,
    PortfolioProjectsController,
    PortfolioBlogController,
    PortfolioLeadsController,
    PortfolioCaseStudiesController,
    PortfolioAvailabilityStatusController,
  ],
})
export class PortfolioModule {}
