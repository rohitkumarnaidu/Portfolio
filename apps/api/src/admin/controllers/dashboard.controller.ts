import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import type { PrismaService } from '../../common/database/prisma.service';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('admin', 'editor')
  @ApiOperation({ summary: 'Get dashboard summary metrics' })
  async getDashboard() {
    const [
      projectCount,
      leadCount,
      blogCount,
      testimonialCount,
      skillCount,
      experienceCount,
      caseStudyCount,
      unreadNotifications,
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.lead.count({ where: { deletedAt: null } }),
      this.prisma.blogPost.count(),
      this.prisma.testimonial.count(),
      this.prisma.skill.count(),
      this.prisma.experience.count(),
      this.prisma.caseStudy.count(),
      this.prisma.notification.count({ where: { isRead: false } }),
    ]);

    return {
      data: {
        projects: projectCount,
        leads: leadCount,
        blogPosts: blogCount,
        testimonials: testimonialCount,
        skills: skillCount,
        experiences: experienceCount,
        caseStudies: caseStudyCount,
        unreadNotifications,
        recentLeads: await this.prisma.lead.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        recentBlogPosts: await this.prisma.blogPost.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      },
    };
  }
}
