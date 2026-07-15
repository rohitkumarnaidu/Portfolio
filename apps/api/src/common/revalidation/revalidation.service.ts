import { Injectable, Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);
  private readonly baseUrl: string;
  private readonly secret: string;

  constructor(private readonly config: ConfigService) {
    const corsOrigin = this.config.get<string>('CORS_ORIGIN', 'http://localhost:3000');
    this.baseUrl = corsOrigin.replace(/\/+$/, '');
    this.secret = process.env.REVALIDATION_SECRET || '';
  }

  async revalidate(tags: string[]): Promise<void> {
    if (!this.secret) {
      this.logger.warn('REVALIDATION_SECRET not set — skipping revalidation');
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': this.secret,
        },
        body: JSON.stringify({ tags }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(`Revalidation failed (${response.status}): ${body}`);
      } else {
        this.logger.log(`Revalidation triggered for tags: ${tags.join(', ')}`);
      }
    } catch (error) {
      this.logger.error(`Revalidation request failed: ${(error as Error).message}`);
    }
  }
}
