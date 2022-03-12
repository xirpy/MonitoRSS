import { CacheModule, Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feeds.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedFeature } from './entities/Feed.entity';
import { DiscordAuthModule } from '../discord-auth/discord-auth.module';
import { FeedFetcherModule } from '../../services/feed-fetcher/feed-fetcher.module';
import { FailRecordFeature } from './entities/fail-record.entity';
import { SupportersModule } from '../supporters/supporters.module';
import { DiscordWebhooksModule } from '../discord-webhooks/discord-webhooks.module';
import { FeedScheduleFeature } from './entities/feed-schedule.entity';
import { FeedSchedulingService } from './feed-scheduling.service';
import { FeedSubscriberFeature } from './entities/feed-subscriber.entity';

@Module({
  controllers: [FeedsController],
  providers: [FeedsService, FeedSchedulingService],
  imports: [
    CacheModule.register(),
    DiscordAuthModule,
    MongooseModule.forFeature([
      FeedFeature,
      FailRecordFeature,
      FeedScheduleFeature,
      FeedSubscriberFeature,
    ]),
    FeedFetcherModule,
    SupportersModule,
    DiscordWebhooksModule,
  ],
  exports: [FeedsService, MongooseModule.forFeature([FeedFeature])],
})
export class FeedsModule {}
