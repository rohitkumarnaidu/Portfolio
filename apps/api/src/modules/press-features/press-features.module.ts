import { Module } from '@nestjs/common';
import { PressFeaturesService } from './press-features.service';

@Module({
  providers: [PressFeaturesService],
  exports: [PressFeaturesService],
})
export class PressFeaturesModule {}
