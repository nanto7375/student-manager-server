import { Injectable } from '@nestjs/common';
import { CacheService } from '@src/common/cache/cache.service';
import { ExternalServerError } from '@src/common/exception/definition.exception';
import { MyLogger } from '@src/configs/logger/my-logger';

@Injectable()
export class DiscardedTokenCache {
  private readonly _DISCARDED_TOKEN_CACHE_KEY_PREFIX = 'discarded_tokens';

  constructor(
    private readonly logger: MyLogger,
    private readonly cacheService: CacheService<string>,
  ) {}

  async set(token: string, ttl: number) {
    try {
      await this.cacheService.set(`${this._DISCARDED_TOKEN_CACHE_KEY_PREFIX}:${token}`, token, ttl);
      return true;
    } catch (e) {
      this.logger.error(e.message);
      throw new ExternalServerError('redis error');
    }
  }

  async get(token: string) {
    try {
      return await this.cacheService.get(`${this._DISCARDED_TOKEN_CACHE_KEY_PREFIX}:${token}`);
    } catch (e) {
      this.logger.error(e.message);
      throw new ExternalServerError('redis error');
    }
  }
}
