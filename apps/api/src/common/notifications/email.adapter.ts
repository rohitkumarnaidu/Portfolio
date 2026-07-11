import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationAdapter, LeadNotificationPayload } from './notification.interface';
import { getTemplate } from './templates/index';

@Injectable()
export class EmailAdapter implements NotificationAdapter {
  private readonly logger = new Logger(EmailAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  async sendNewLeadNotification(payload: LeadNotificationPayload): Promise<void> {
    const apiKey = this.configService.get<string>('app.RESEND_API_KEY');
    if (!apiKey) {
      this.logger.log(`[EMAIL STUB] Resend not configured. New lead from ${payload.name} (${payload.email})`);
      return;
    }

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      const from = this.configService.get<string>('app.EMAIL_FROM') || 'noreply@portfolio.com';
      const adminEmail = this.configService.get<string>('app.ADMIN_NOTIFICATION_EMAIL') || 'admin@portfolio.com';

      const html = getTemplate('new-lead-notification', {
        name: payload.name,
        email: payload.email,
        phone: payload.phone || '',
        company: payload.company || '',
        subject: payload.subject || 'No subject',
        source: payload.source,
        message: payload.message,
        createdAt: payload.createdAt,
      });

      await resend.emails.send({
        from,
        to: [adminEmail],
        subject: `New Lead: ${payload.name} - ${payload.subject || 'No subject'}`,
        html,
      });
      this.logger.log(`Email notification sent to ${adminEmail} for lead ${payload.leadId}`);
    } catch (err) {
      this.logger.error(`Failed to send email notification: ${err}`);
    }
  }

  async sendLeadStatusChanged(leadId: string, email: string, name: string, newStatus: string): Promise<void> {
    const apiKey = this.configService.get<string>('app.RESEND_API_KEY');
    if (!apiKey) {
      this.logger.log(`[EMAIL STUB] Resend not configured. Lead ${leadId} status → ${newStatus}`);
      return;
    }

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      const from = this.configService.get<string>('app.EMAIL_FROM') || 'noreply@portfolio.com';

      const html = getTemplate('lead-status-changed', {
        name,
        leadId: leadId.slice(0, 8) + '...',
        newStatus,
      });

      await resend.emails.send({
        from,
        to: [email],
        subject: `Your inquiry status has been updated: ${newStatus}`,
        html,
      });
      this.logger.log(`Status change email sent to ${email} for lead ${leadId}`);
    } catch (err) {
      this.logger.error(`Failed to send status change email: ${err}`);
    }
  }
}
