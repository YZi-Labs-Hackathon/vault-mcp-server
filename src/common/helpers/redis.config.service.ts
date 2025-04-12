import { Injectable } from '@nestjs/common';
import {
  RedisModuleOptions,
  RedisModuleOptionsFactory,
} from '@nestjs-modules/ioredis/dist/redis.interfaces';

@Injectable()
export class RedisConfigService implements RedisModuleOptionsFactory {
  createRedisModuleOptions(): Promise<RedisModuleOptions> | RedisModuleOptions {
    return {
      type: 'single',
      url: process.env.REDIS_URI,
      options: {
        keyPrefix: `${process.env.REDIS_PREFIX}:`,
      },
    };
  }
}
