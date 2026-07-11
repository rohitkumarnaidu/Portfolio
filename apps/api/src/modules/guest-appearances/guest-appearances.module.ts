import { Module } from '@nestjs/common';
import { GuestAppearancesService } from './guest-appearances.service';

@Module({
  providers: [GuestAppearancesService],
  exports: [GuestAppearancesService],
})
export class GuestAppearancesModule {}
