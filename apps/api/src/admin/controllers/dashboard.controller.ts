import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { SectionsService } from '../../modules/sections/sections.service';
import { ProjectsService } from '../../modules/projects/projects.service';
import { SkillsService } from '../../modules/skills/skills.service';
import { ExperiencesService } from '../../modules/experiences/experiences.service';
import { BlogService } from '../../modules/blog/blog.service';
import { TestimonialsService } from '../../modules/testimonials/testimonials.service';
import { ServicesService } from '../../modules/services/services.service';
import { FaqsService } from '../../modules/faqs/faqs.service';
import { LeadsService } from '../../modules/leads/leads.service';
import { AnalyticsService } from '../../modules/analytics/analytics.service';
import { ActivitiesService } from '../../modules/activities/activities.service';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(
    private readonly sections: SectionsService,
    private readonly projects: ProjectsService,
    private readonly skills: SkillsService,
    private readonly experiences: ExperiencesService,
    private readonly blog: BlogService,
    private readonly testimonials: TestimonialsService,
    private readonly services: ServicesService,
    private readonly faqs: FaqsService,
    private readonly leads: LeadsService,
    private readonly analytics: AnalyticsService,
    private readonly activities: ActivitiesService,
  ) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get aggregated dashboard stats' })
  async getDashboard() {
    const [sections, projects, skillsResult, experiencesResult, blogResult, testimonialsResult, servicesResult, faqsResult, leadsResult, analyticsSummary, activityStats] = await Promise.all([
      this.sections.findAll(),
      this.projects.findAll({}),
      this.skills.findAll(),
      this.experiences.findAll(),
      this.blog.findAll(),
      this.testimonials.findAll(),
      this.services.findAll(),
      this.faqs.findAll(),
      this.leads.findAll({}),
      this.analytics.getSummary('30d'),
      this.activities.getStats(),
    ]);

    return {
      data: {
        counts: {
          sections: sections.data.length,
          projects: projects.meta.total,
          skills: skillsResult.data.length,
          experiences: experiencesResult.data.length,
          blog_posts: blogResult.meta.total,
          testimonials: testimonialsResult.data.length,
          services: servicesResult.data.length,
          faqs: faqsResult.data.length,
          leads: leadsResult.meta.total,
        },
        recent_leads: leadsResult.data.slice(0, 5),
        analytics: analyticsSummary,
        activity_stats: activityStats,
      },
    };
  }
}
