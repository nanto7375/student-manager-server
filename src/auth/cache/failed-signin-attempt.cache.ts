import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MyCacheService } from '@src/common/cache/my-cache.service';

@Injectable()
export class FailedSigninAttemptCache {
  private readonly _FAILED_ATTEMPTS_CACHE_KEY_PREFIX = 'failed_attempts';
  private readonly _SIGNIN_FAILED_ATTEMPTS_CLEAR_TTL: number;

  constructor(
    private readonly cacheService: MyCacheService<number>,
    private readonly configService: ConfigService,
  ) {
    this._SIGNIN_FAILED_ATTEMPTS_CLEAR_TTL = this.configService.get('SM_SIGNIN_FAILED_ATTEMPTS_CLEAR_TTL');
  }

  async get(email: string): Promise<number> {
    return (await this.cacheService.get(`${this._FAILED_ATTEMPTS_CACHE_KEY_PREFIX}:${email}`)) || 0;
  }

  async set(email: string, attempts: number, ttl: number = this._SIGNIN_FAILED_ATTEMPTS_CLEAR_TTL) {
    await this.cacheService.set(`${this._FAILED_ATTEMPTS_CACHE_KEY_PREFIX}:${email}`, attempts, ttl);
    return true;
  }

  async clear(email: string) {
    await this.cacheService.del(`${this._FAILED_ATTEMPTS_CACHE_KEY_PREFIX}:${email}`);
    return true;
  }
}
