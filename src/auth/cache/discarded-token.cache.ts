import { Injectable } from '@nestjs/common';
import { CacheService } from '@src/common/cache/cache.service';

@Injectable()
export class DiscardedTokenCache {
  private readonly _DISCARDED_TOKEN_CACHE_KEY_PREFIX = 'discarded_tokens';

  constructor(private readonly cacheService: CacheService<string>) {}

  async set(token: string, ttl: number) {
    await this.cacheService.set(`${this._DISCARDED_TOKEN_CACHE_KEY_PREFIX}:${token}`, token, ttl);
    return true;
  }

  get(token: string): Promise<string> {
    return this.cacheService.get(`${this._DISCARDED_TOKEN_CACHE_KEY_PREFIX}:${token}`);
  }
}
