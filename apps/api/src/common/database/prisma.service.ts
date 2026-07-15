import type { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
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
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
    });
  }

  get user() {
    return this.client.user;
  }
  get role() {
    return this.client.role;
  }
  get permission() {
    return this.client.permission;
  }
  get userRole() {
    return this.client.userRole;
  }
  get section() {
    return this.client.section;
  }
  get project() {
    return this.client.project;
  }
  get projectImage() {
    return this.client.projectImage;
  }
  get blogPost() {
    return this.client.blogPost;
  }
  get postTag() {
    return this.client.postTag;
  }
  get testimonial() {
    return this.client.testimonial;
  }
  get skill() {
    return this.client.skill;
  }
  get experience() {
    return this.client.experience;
  }
  get achievement() {
    return this.client.achievement;
  }
  get service() {
    return this.client.service;
  }
  get caseStudy() {
    return this.client.caseStudy;
  }
  get pressFeature() {
    return this.client.pressFeature;
  }
  get guestAppearance() {
    return this.client.guestAppearance;
  }
  get readingListItem() {
    return this.client.readingListItem;
  }
  get lead() {
    return this.client.lead;
  }
  get leadNote() {
    return this.client.leadNote;
  }
  get leadActivity() {
    return this.client.leadActivity;
  }
  get analyticsEvent() {
    return this.client.analyticsEvent;
  }
  get analyticsSession() {
    return this.client.analyticsSession;
  }
  get pageView() {
    return this.client.pageView;
  }
  get chatConversation() {
    return this.client.chatConversation;
  }
  get chatMessage() {
    return this.client.chatMessage;
  }
  get documentChunk() {
    return this.client.documentChunk;
  }
  get embeddingCache() {
    return this.client.embeddingCache;
  }
  get mediaAsset() {
    return this.client.mediaAsset;
  }
  get availabilityStatus() {
    return this.client.availabilityStatus;
  }
  get systemSetting() {
    return this.client.systemSetting;
  }
  get notification() {
    return this.client.notification;
  }
  get auditLog() {
    return this.client.auditLog;
  }
  get session() {
    return this.client.session;
  }
  get apiKey() {
    return this.client.apiKey;
  }
  get featureFlag() {
    return this.client.featureFlag;
  }
  get adminActivity() {
    return this.client.adminActivity;
  }
  get fAQ() {
    return this.client.fAQ;
  }

  get $queryRaw() {
    return this.client.$queryRaw.bind(this.client);
  }
  get $executeRaw() {
    return this.client.$executeRaw.bind(this.client);
  }

  async onModuleInit() {
    await this.client.$connect();
    this.logger.log('Connected to database');
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    this.logger.log('Disconnected from database');
  }
}
