import type { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
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
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 900000, limit: 5 },
      { name: 'leads', ttl: 900000, limit: 10 },
      { name: 'chat', ttl: 3600000, limit: 20 },
      { name: 'admin', ttl: 900000, limit: 1000 },
    ]),
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
    consumer.apply(ApiVersionMiddleware).forRoutes('*');
    consumer.apply(CoepCoopMiddleware).forRoutes('/admin/sandbox*');
  }
}
