import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    this.logger.log(`Processing email job ${job.id} of type ${job.name}`);

    const apiKey = this.configService.get<string>('app.RESEND_API_KEY');
    if (!apiKey) {
      this.logger.log(`[QUEUE STUB] Resend not configured. Skipping email ${job.name}`);
      return;
    }

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      const { type, to, subject, html } = job.data;

      await resend.emails.send({
        from: this.configService.get<string>('app.EMAIL_FROM') || 'noreply@portfolio.com',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      });

      this.logger.log(`Email job ${job.id} completed: ${type} → ${to}`);
    } catch (err) {
      this.logger.error(`Email job ${job.id} failed: ${err}`);
      throw err;
    }
  }
}
