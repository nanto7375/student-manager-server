import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cache } from 'cache-manager';

import { MyLogger } from '@src/configs/logger/my-logger';

@Injectable()
export class MyCacheService<T> {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly logger: MyLogger,
  ) {
    this.logger.setContext('CacheService');
  }

  async get(key: string): Promise<T> {
    try {
      return (await this.cacheManager.get(key)) as T;
    } catch (e) {
      this.logger.error(e.message);
      throw new InternalServerErrorException('redis error');
    }
  }

  async set(key: string, value: T, ttl?: number) {
    try {
      return await this.cacheManager.set(key, value, ttl ?? 0);
    } catch (e) {
      this.logger.error(e.message);
      throw new InternalServerErrorException('redis error');
    }
  }

  async delete(key: string) {
    try {
      return await this.cacheManager.del(key);
    } catch (e) {
      this.logger.error(e.message);
      throw new InternalServerErrorException('redis error');
    }
  }

  async getKeys(pattern?: string) {
    try {
      return await this.cacheManager.store.keys(pattern);
    } catch (e) {
      this.logger.error(e.message);
      throw new InternalServerErrorException('redis error');
    }
  }
}
