import { ConfigService } from '@nestjs/config';

import { createMariaDbConfig } from './prisma.service';

describe('createMariaDbConfig', () => {
  const createConfigService = (allowPublicKeyRetrieval: boolean) =>
    ({
      get: jest.fn((key: string) => {
        const values: Record<string, string | number | boolean> = {
          SM_MYSQL_DB: 'student_manager',
          SM_MYSQL_DB_HOST: 'localhost',
          SM_MYSQL_DB_PORT: 3306,
          SM_MYSQL_DB_USER: 'test-user',
          SM_MYSQL_DB_PASSWORD: 'test-password',
          SM_MYSQL_ALLOW_PUBLIC_KEY_RETRIEVAL: allowPublicKeyRetrieval,
        };

        return values[key];
      }),
    }) as unknown as ConfigService;

  it('passes the explicit RSA public-key retrieval flag to the MariaDB adapter', () => {
    expect(createMariaDbConfig(createConfigService(true))).toMatchObject({
      allowPublicKeyRetrieval: true,
    });
    expect(createMariaDbConfig(createConfigService(false))).toMatchObject({
      allowPublicKeyRetrieval: false,
    });
  });

  it('uses the bounded connection-pool settings', () => {
    expect(createMariaDbConfig(createConfigService(false))).toMatchObject({
      connectionLimit: 10,
      minimumIdle: 2,
      connectTimeout: 10000,
      acquireTimeout: 10000,
    });
  });
});
