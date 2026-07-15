import { Module } from '@nestjs/common';
import { NotificationModule } from '../../common/notifications/notification.module';
import { LeadsService } from './leads.service';
@Module({ imports: [NotificationModule], providers: [LeadsService], exports: [LeadsService] })
export class LeadsModule {}
