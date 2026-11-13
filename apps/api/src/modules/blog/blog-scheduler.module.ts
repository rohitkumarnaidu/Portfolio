import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BlogModule } from './blog.module';
import { BlogSchedulerService } from './blog-scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot(), BlogModule],
  providers: [BlogSchedulerService],
})
export class BlogSchedulerModule {}
