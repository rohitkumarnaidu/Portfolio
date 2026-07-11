import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  public readonly client: PrismaClient;

  constructor() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    this.client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    });
  }

  get blogPost() { return this.client.blogPost; }
  get skill() { return this.client.skill; }
  get section() { return this.client.section; }
  get project() { return this.client.project; }
  get projectImage() { return this.client.projectImage; }
  get testimonial() { return this.client.testimonial; }
  get service() { return this.client.service; }
  get experience() { return this.client.experience; }
  get fAQ() { return this.client.fAQ; }
  get lead() { return this.client.lead; }
  get leadNote() { return this.client.leadNote; }
  get leadActivity() { return this.client.leadActivity; }
  get analyticsEvent() { return this.client.analyticsEvent; }
  get analyticsSession() { return this.client.analyticsSession; }
  get pageView() { return this.client.pageView; }
  get user() { return this.client.user; }
  get session() { return this.client.session; }
  get mediaAsset() { return this.client.mediaAsset; }
  get auditLog() { return this.client.auditLog; }
  get adminActivity() { return this.client.adminActivity; }
  get systemSetting() { return this.client.systemSetting; }
  get notification() { return this.client.notification; }
  get caseStudy() { return this.client.caseStudy; }
  get chatConversation() { return this.client.chatConversation; }
  get chatMessage() { return this.client.chatMessage; }
  get postTag() { return this.client.postTag; }
  get achievement() { return this.client.achievement; }
  get pressFeature() { return this.client.pressFeature; }
  get guestAppearance() { return this.client.guestAppearance; }
  get readingListItem() { return this.client.readingListItem; }
  get availabilityStatus() { return this.client.availabilityStatus; }
  get apiKey() { return this.client.apiKey; }
  get featureFlag() { return this.client.featureFlag; }

  get $queryRaw() { return this.client.$queryRaw.bind(this.client); }
  get $executeRaw() { return this.client.$executeRaw.bind(this.client); }

  async onModuleInit() {
    await this.client.$connect();
    this.logger.log('Connected to database');
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    this.logger.log('Disconnected from database');
  }
}