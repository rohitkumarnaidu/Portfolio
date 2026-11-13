import { Module } from '@nestjs/common';
import { AvailabilityStatusService } from './availability-status.service';

@Module({
  providers: [AvailabilityStatusService],
  exports: [AvailabilityStatusService],
})
export class AvailabilityStatusModule {}
