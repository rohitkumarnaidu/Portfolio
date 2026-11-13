import { Module } from '@nestjs/common';
import { CaseStudiesService } from './case-studies.service';

@Module({
  providers: [CaseStudiesService],
  exports: [CaseStudiesService],
})
export class CaseStudiesModule {}
