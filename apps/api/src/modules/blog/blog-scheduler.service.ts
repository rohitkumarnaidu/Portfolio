import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { BlogService } from './blog.service';

@Injectable()
export class BlogSchedulerService {
  private readonly logger = new Logger(BlogSchedulerService.name);

  constructor(private readonly blogService: BlogService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAndPublish() {
    try {
      const posts = await this.blogService.getScheduledPosts();
      for (const post of posts) {
        await this.blogService.publish(post.id, post.publishedAt ?? new Date());
        this.logger.log(`Scheduled post published: ${post.title} (${post.id})`);
      }
    } catch (error) {
      this.logger.error(`Scheduler error: ${(error as Error).message}`);
    }
  }
}
