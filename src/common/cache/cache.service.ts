import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

import { MyLogger } from '@src/configs/logger/my-logger';
import { ExternalServerError } from '../exception/definition.exception';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly logger: MyLogger,
  ) {
    this.logger.setContext('CacheService');
  }

  async get<T>(key: string): Promise<T> {
    try {
      return (await this.cacheManager.get(key)) as T;
    } catch (e) {
      this.logger.error(e.message);
      throw new ExternalServerError('redis error');
    }
  }

  async set(key: string, value: any, ttl?: number) {
    try {
      return await this.cacheManager.set(key, value, ttl ?? 0);
    } catch (e) {
      this.logger.error(e.message);
      throw new ExternalServerError('redis error');
    }
  }

  async del(key: string) {
    try {
      return await this.cacheManager.del(key);
    } catch (e) {
      this.logger.error(e.message);
      throw new ExternalServerError('redis error');
    }
  }

  async getKeys(pattern?: string) {
    try {
      return await this.cacheManager.store.keys(pattern);
    } catch (e) {
      this.logger.error(e.message);
      throw new ExternalServerError('redis error');
    }
  }
}
