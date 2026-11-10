import type { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheModule } from './common/cache/cache.module';
import { CleanupModule } from './common/cleanup/cleanup.module';
import { RevalidationModule } from './common/revalidation/revalidation.module';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { config } from './config/env.config';
import { DatabaseModule } from './common/database/database.module';
import { QueueModule } from './common/queue/queue.module';
import { HealthModule } from './health/health.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AdminModule } from './admin/admin.module';
import { BlogSchedulerModule } from './modules/blog/blog-scheduler.module';
import { EventsModule } from './modules/events/events.module';
import { SearchModule } from './modules/search/search.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ApiVersionMiddleware } from './common/middleware/api-version.middleware';
import { CoepCoopMiddleware } from './common/middleware/coep-coop.middleware';
import { KeyNormalizationMiddleware } from './common/middleware/key-normalization.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      // Centralized env file (works from apps/api and from the repo root),
      // then per-app overrides. Real process env always wins.
      envFilePath: [
        path.resolve(process.cwd(), '../../config/.env'),
        path.resolve(process.cwd(), 'config/.env'),
        '.env.local',
        '.env',
      ],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'body.password',
          'body.passwordHash',
        ],
        quietReqLogger: true,
      },
    }),
    // One global bucket. Route-specific limits are applied with @Throttle on
    // the handlers that need them (login, leads, chat); extra named buckets
    // here would apply to every route and exhaust after a few requests.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
    NestCacheModule.register({ ttl: 60 }),
    CacheModule,
    CleanupModule,
    RevalidationModule,
    DatabaseModule,
    QueueModule,
    HealthModule,
    EventsModule,
    SearchModule,
    BlogSchedulerModule,
    WebhooksModule,
    PortfolioModule,
    AdminModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiVersionMiddleware, KeyNormalizationMiddleware).forRoutes('*');
    consumer.apply(CoepCoopMiddleware).forRoutes('/admin/sandbox*');
  }
}
