import { Injectable } from '@nestjs/common';
import { MyCacheService } from '@src/configs/cache/my-cache.service';

@Injectable()
export class DiscardedTokenCache {
  private readonly _DISCARDED_TOKEN_CACHE_KEY_PREFIX = 'discarded-tokens';

  constructor(private readonly cacheService: MyCacheService<string>) {}

  async set(token: string, ttl: number) {
    await this.cacheService.set(`${this._DISCARDED_TOKEN_CACHE_KEY_PREFIX}:${token}`, token, ttl);
    return true;
  }

  get(token: string): Promise<string> {
    return this.cacheService.get(`${this._DISCARDED_TOKEN_CACHE_KEY_PREFIX}:${token}`);
  }
}
