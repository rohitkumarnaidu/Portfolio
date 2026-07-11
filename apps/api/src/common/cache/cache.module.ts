import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [CacheService, ConfigService],
  exports: [CacheService],
})
export class CacheModule {}
