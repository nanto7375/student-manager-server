import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '@src/common/cache/cache.service';

@Injectable()
export class FailedSigninAttemptCache {
  private readonly _FAILED_ATTEMPTS_CACHE_KEY_PREFIX = 'failed_attempts';
  private readonly _FAILED_ATTEMPTS_CACHE_TTL: number;

  constructor(
    private readonly cacheService: CacheService<number>,
    private readonly configService: ConfigService,
  ) {
    this._FAILED_ATTEMPTS_CACHE_TTL = this.configService.get('SM_SIGNIN_FAILED_ATTEMPTS_CACHE_TTL');
  }

  async get(email: string) {
    return (await this.cacheService.get(`${this._FAILED_ATTEMPTS_CACHE_KEY_PREFIX}:${email}`)) || 0;
  }

  async set(email: string, attempts: number) {
    await this.cacheService.set(`${this._FAILED_ATTEMPTS_CACHE_KEY_PREFIX}:${email}`, attempts, this._FAILED_ATTEMPTS_CACHE_TTL);
  }

  async clear(email: string) {
    await this.cacheService.del(`${this._FAILED_ATTEMPTS_CACHE_KEY_PREFIX}:${email}`);
  }
}
