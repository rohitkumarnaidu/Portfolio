import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailAdapter } from './email.adapter';

export const NOTIFICATION_ADAPTER = 'NOTIFICATION_ADAPTER';

@Module({
  imports: [ConfigModule],
  providers: [
    EmailAdapter,
    { provide: NOTIFICATION_ADAPTER, useExisting: EmailAdapter },
  ],
  exports: [NOTIFICATION_ADAPTER],
})
export class NotificationModule {}
