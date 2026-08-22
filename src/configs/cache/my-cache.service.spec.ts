import { MyLogger } from '@src/configs/logger/my-logger';
import { Cache } from 'cache-manager';

import { MyCacheService } from './my-cache.service';

describe('MyCacheService', () => {
  it('lists keys from the Keyv store and applies a Redis-style wildcard pattern', async () => {
    const iterator = async function* () {
      yield ['failed-attempts:first@example.com', 1];
      yield ['discarded-tokens:token', 'token'];
      yield ['failed-attempts:second@example.com', 2];
    };
    const cacheManager = {
      stores: [{ iterator }],
    } as unknown as Cache;
    const logger = {
      setContext: jest.fn(),
      error: jest.fn(),
    } as unknown as MyLogger;
    const service = new MyCacheService(cacheManager, logger);

    await expect(service.getKeys('failed-attempts:*')).resolves.toEqual(['failed-attempts:first@example.com', 'failed-attempts:second@example.com']);
  });
});
