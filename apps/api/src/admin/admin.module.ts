import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from '../modules/auth/auth.module';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import { CsvService } from '../common/export/csv.service';
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
import { ActivitiesModule } from '../modules/activities/activities.module';
import { UsersModule } from '../modules/users/users.module';
import { MediaModule } from '../modules/media/media.module';
import { CaseStudiesModule } from '../modules/case-studies/case-studies.module';
import { AchievementsModule } from '../modules/achievements/achievements.module';
import { PressFeaturesModule } from '../modules/press-features/press-features.module';
import { GuestAppearancesModule } from '../modules/guest-appearances/guest-appearances.module';
import { ReadingListItemsModule } from '../modules/reading-list-items/reading-list-items.module';
import { AvailabilityStatusModule } from '../modules/availability-status/availability-status.module';
import { SystemSettingsModule } from '../modules/system-settings/system-settings.module';
import { ApiKeysModule } from '../modules/api-keys/api-keys.module';
import { FeatureFlagsModule } from '../modules/feature-flags/feature-flags.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { ChatModule } from '../modules/chat/chat.module';
import { SandboxModule } from '../modules/sandbox/sandbox.module';
import { EventsModule } from '../modules/events/events.module';
import { WebhooksModule } from '../modules/webhooks/webhooks.module';
import { AdminAuthController } from './controllers/auth.controller';
import { AdminEventsController } from './controllers/events.controller';
import { AdminDashboardController } from './controllers/dashboard.controller';
import { AdminSandboxController } from './controllers/sandbox.controller';
import { AdminSectionsController } from './controllers/sections.controller';
import { AdminProjectsController } from './controllers/projects.controller';
import { AdminSkillsController } from './controllers/skills.controller';
import { AdminExperiencesController } from './controllers/experiences.controller';
import { AdminBlogController } from './controllers/blog.controller';
import { AdminTestimonialsController } from './controllers/testimonials.controller';
import { AdminServicesController } from './controllers/services.controller';
import { AdminFaqsController } from './controllers/faqs.controller';
import { AdminLeadsController } from './controllers/leads.controller';
import { AdminAnalyticsController } from './controllers/analytics.controller';
import { AdminActivitiesController } from './controllers/activities.controller';
import { AdminCaseStudiesController } from './controllers/case-studies.controller';
import { AdminAchievementsController } from './controllers/achievements.controller';
import { AdminPressFeaturesController } from './controllers/press-features.controller';
import { AdminGuestAppearancesController } from './controllers/guest-appearances.controller';
import { AdminReadingListItemsController } from './controllers/reading-list-items.controller';
import { AdminAvailabilityStatusController } from './controllers/availability-status.controller';
import { AdminUsersController } from './controllers/users.controller';
import { AdminMediaController } from './controllers/media.controller';
import { AdminSystemSettingsController } from './controllers/system-settings.controller';
import { AdminApiKeysController } from './controllers/api-keys.controller';
import { AdminFeatureFlagsController } from './controllers/feature-flags.controller';
import { AdminNotificationsController } from './controllers/notifications.controller';
import { AdminChatController } from './controllers/chat.controller';
import { AdminExportController } from './controllers/export.controller';
import { AdminCleanupController } from './controllers/cleanup.controller';
import { AdminSearchController } from './controllers/search.controller';

@Module({
  imports: [
    AuthModule,
    SectionsModule,
    ProjectsModule,
    SkillsModule,
    ExperiencesModule,
    BlogModule,
    TestimonialsModule,
    ServicesModule,
    FaqsModule,
    LeadsModule,
    AnalyticsModule,
    ActivitiesModule,
    UsersModule,
    MediaModule,
    CaseStudiesModule,
    AchievementsModule,
    PressFeaturesModule,
    GuestAppearancesModule,
    ReadingListItemsModule,
    AvailabilityStatusModule,
    SystemSettingsModule,
    ApiKeysModule,
    FeatureFlagsModule,
    NotificationsModule,
    ChatModule,
    SandboxModule,
    EventsModule,
    WebhooksModule,
  ],
  controllers: [
    AdminAuthController,
    AdminDashboardController,
    AdminSandboxController,
    AdminSectionsController,
    AdminEventsController,
    AdminProjectsController,
    AdminSkillsController,
    AdminExperiencesController,
    AdminBlogController,
    AdminTestimonialsController,
    AdminServicesController,
    AdminFaqsController,
    AdminLeadsController,
    AdminAnalyticsController,
    AdminActivitiesController,
    AdminUsersController,
    AdminMediaController,
    AdminCaseStudiesController,
    AdminAchievementsController,
    AdminPressFeaturesController,
    AdminGuestAppearancesController,
    AdminReadingListItemsController,
    AdminAvailabilityStatusController,
    AdminSystemSettingsController,
    AdminApiKeysController,
    AdminFeatureFlagsController,
    AdminNotificationsController,
    AdminChatController,
    AdminExportController,
    AdminCleanupController,
    AdminSearchController,
  ],
  providers: [CsvService, { provide: APP_INTERCEPTOR, useClass: AuditInterceptor }],
})
export class AdminModule {}
