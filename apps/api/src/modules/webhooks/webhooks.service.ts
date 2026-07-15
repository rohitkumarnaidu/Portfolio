import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import type { CreateWebhookDto } from './dto/create-webhook.dto';

interface WebhookRegistration {
  id: string;
  name: string;
  url: string;
  events: string[];
  method: string;
  headers: Record<string, string>;
  isActive: boolean;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async register(dto: CreateWebhookDto): Promise<WebhookRegistration> {
    const webhook = {
      id: crypto.randomUUID(),
      name: dto.name,
      url: dto.url,
      events: dto.events,
      method: dto.method || 'POST',
      headers: dto.headers || {},
      isActive: dto.isActive ?? true,
    };
    const key = `webhook:${webhook.id}`;
    await this.prisma.systemSetting.upsert({
      where: { settingKey: key },
      create: {
        settingKey: key,
        settingValue: JSON.stringify(webhook),
        settingGroup: 'webhooks',
        dataType: 'json',
        description: `Webhook: ${dto.name}`,
      },
      update: {
        settingValue: JSON.stringify(webhook),
        description: `Webhook: ${dto.name}`,
      },
    });
    return webhook;
  }

  async findAll(): Promise<WebhookRegistration[]> {
    const settings = await this.prisma.systemSetting.findMany({
      where: { settingGroup: 'webhooks' },
    });
    return settings
      .map((s) => {
        try {
          return JSON.parse(s.settingValue) as WebhookRegistration;
        } catch {
          return null;
        }
      })
      .filter((w): w is WebhookRegistration => w !== null);
  }

  async findById(id: string): Promise<WebhookRegistration> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { settingKey: `webhook:${id}` },
    });
    if (!setting) throw new NotFoundException('Webhook not found');
    try {
      return JSON.parse(setting.settingValue) as WebhookRegistration;
    } catch {
      throw new NotFoundException('Webhook not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.systemSetting.delete({
        where: { settingKey: `webhook:${id}` },
      });
    } catch {
      throw new NotFoundException('Webhook not found');
    }
  }

  async trigger(event: string, payload: Record<string, unknown>) {
    const webhooks = await this.findAll();
    const matching = webhooks.filter((w) => w.isActive && w.events.includes(event));
    if (matching.length === 0) return { triggered: 0, errors: 0 };

    let triggered = 0;
    let errors = 0;
    for (const webhook of matching) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(webhook.url, {
          method: webhook.method,
          headers: { 'Content-Type': 'application/json', ...webhook.headers },
          body: JSON.stringify({ event, payload, timestamp: new Date().toISOString() }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (response.ok) {
          triggered++;
        } else {
          errors++;
          this.logger.warn(`Webhook ${webhook.id} returned ${response.status}`);
        }
      } catch (err) {
        errors++;
        this.logger.error(
          `Webhook ${webhook.id} failed`,
          err instanceof Error ? err.message : String(err),
        );
      }
    }
    return { triggered, errors, total: matching.length };
  }

  async retry(id: string, event: string, payload: Record<string, unknown>) {
    const webhook = await this.findById(id);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: {
          'Content-Type': 'application/json' as string,
          ...(webhook.headers as Record<string, string>),
        },
        body: JSON.stringify({ event, payload, timestamp: new Date().toISOString() }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return { success: response.ok, statusCode: response.status };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}
