import { Module } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
@Module({ providers: [TestimonialsService], exports: [TestimonialsService] })
export class TestimonialsModule {}

