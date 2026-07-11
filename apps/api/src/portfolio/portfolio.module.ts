import { Module } from '@nestjs/common';
import { SectionsModule } from '../modules/sections/sections.module';
import { ProjectsModule } from '../modules/projects/projects.module';
import { SkillsModule } from '../modules/skills/skills.module';
import { ExperiencesModule } from '../modules/experiences/experiences.module';
import { BlogModule } from '../modules/blog/blog.module';
import { TestimonialsModule } from '../modules/testimonials/testimonials.module';
import { ServicesModule } from '../modules/services/services.module';
import { FaqsModule } from '../modules/faqs/faqs.module';
import { LeadsModule } from '../modules/leads/leads.module';
import { AnalyticsModule } from '../modules/analytics/analytics.module';
import { CaseStudiesModule } from '../modules/case-studies/case-studies.module';
import { AchievementsModule } from '../modules/achievements/achievements.module';
import { PressFeaturesModule } from '../modules/press-features/press-features.module';
import { GuestAppearancesModule } from '../modules/guest-appearances/guest-appearances.module';
import { ReadingListItemsModule } from '../modules/reading-list-items/reading-list-items.module';
import { AvailabilityStatusModule } from '../modules/availability-status/availability-status.module';
import { FeatureFlagsModule } from '../modules/feature-flags/feature-flags.module';
import { ChatModule } from '../modules/chat/chat.module';
import { PortfolioSectionsController } from './controllers/sections.controller';
import { PortfolioProjectsController } from './controllers/projects.controller';
import { PortfolioSkillsController } from './controllers/skills.controller';
import { PortfolioExperiencesController } from './controllers/experiences.controller';
import { PortfolioBlogController } from './controllers/blog.controller';
import { PortfolioTestimonialsController } from './controllers/testimonials.controller';
import { PortfolioServicesController } from './controllers/services.controller';
import { PortfolioFaqsController } from './controllers/faqs.controller';
import { PortfolioLeadsController } from './controllers/leads.controller';
import { PortfolioAnalyticsController } from './controllers/analytics.controller';
import { PortfolioCaseStudiesController } from './controllers/case-studies.controller';
import { PortfolioAchievementsController } from './controllers/achievements.controller';
import { PortfolioPressFeaturesController } from './controllers/press-features.controller';
import { PortfolioGuestAppearancesController } from './controllers/guest-appearances.controller';
import { PortfolioReadingListItemsController } from './controllers/reading-list-items.controller';
import { PortfolioAvailabilityStatusController } from './controllers/availability-status.controller';
import { PortfolioFeatureFlagsController } from './controllers/feature-flags.controller';
import { PortfolioChatController } from './controllers/chat.controller';

@Module({
  imports: [
    SectionsModule, ProjectsModule, SkillsModule, ExperiencesModule,
    BlogModule, TestimonialsModule, ServicesModule, FaqsModule,
    LeadsModule, AnalyticsModule,
    CaseStudiesModule, AchievementsModule, PressFeaturesModule,
    GuestAppearancesModule, ReadingListItemsModule, AvailabilityStatusModule,
    FeatureFlagsModule, ChatModule,
  ],
  controllers: [
    PortfolioSectionsController, PortfolioProjectsController,
    PortfolioSkillsController, PortfolioExperiencesController,
    PortfolioBlogController, PortfolioTestimonialsController,
    PortfolioServicesController, PortfolioFaqsController,
    PortfolioLeadsController, PortfolioAnalyticsController,
    PortfolioCaseStudiesController, PortfolioAchievementsController,
    PortfolioPressFeaturesController, PortfolioGuestAppearancesController,
    PortfolioReadingListItemsController, PortfolioAvailabilityStatusController,
    PortfolioFeatureFlagsController, PortfolioChatController,
  ],
})
export class PortfolioModule {}
