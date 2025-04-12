import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import * as configs from '@config';
import { HttpModule } from '@nestjs/axios';
import { ChatModule } from '@modules/chat/chat.module';

import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisConfigService } from './common/helpers/redis.config.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      load: Object.values(configs),
      isGlobal: true,
    }),
    HttpModule,
    RedisModule.forRootAsync({ useClass: RedisConfigService }),
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
