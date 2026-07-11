import { Module } from '@nestjs/common';
import { ReadingListItemsService } from './reading-list-items.service';

@Module({
  providers: [ReadingListItemsService],
  exports: [ReadingListItemsService],
})
export class ReadingListItemsModule {}
