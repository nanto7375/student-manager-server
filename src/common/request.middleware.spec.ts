import { MyLogger } from '@src/configs/logger/my-logger';
import { NextFunction, Request, Response } from 'express';

import { RequestMiddleware } from './request.middleware';

describe('RequestMiddleware', () => {
  let logger: {
    setContext: jest.Mock;
    log: jest.Mock;
  };
  let middleware: RequestMiddleware;

  beforeEach(() => {
    logger = {
      setContext: jest.fn(),
      log: jest.fn(),
    };
    middleware = new RequestMiddleware(logger as unknown as MyLogger);
  });

  it('redacts secrets from headers, URL parameters, and nested request bodies without mutating the request', () => {
    const request = {
      hostname: 'localhost',
      ip: '127.0.0.1',
      method: 'POST',
      originalUrl: '/v1/auth/signin?access_token=query-secret&studentId=7',
      headers: {
        authorization: 'Bearer header-secret',
        cookie: 'refr=cookie-secret',
        'x-api-key': 'header-api-secret',
        accept: 'application/json',
      },
      body: {
        email: 'student@example.com',
        password: 'body-password-secret',
        nested: {
          refresh_token: 'body-refresh-secret',
          note: 'keep this value',
        },
        items: [{ clientSecret: 'body-client-secret' }],
      },
    } as unknown as Request;
    const next = jest.fn() as NextFunction;

    middleware.use(request, {} as Response, next);

    const logged = logger.log.mock.calls[0][0];
    const serialized = JSON.stringify(logged);
    for (const secret of ['query-secret', 'header-secret', 'cookie-secret', 'header-api-secret', 'body-password-secret', 'body-refresh-secret', 'body-client-secret']) {
      expect(serialized).not.toContain(secret);
    }
    expect(logged).toMatchObject({
      url: '/v1/auth/signin?access_token=%5BREDACTED%5D&studentId=7',
      headers: {
        authorization: '[REDACTED]',
        cookie: '[REDACTED]',
        'x-api-key': '[REDACTED]',
        accept: 'application/json',
      },
      body: {
        email: 'student@example.com',
        password: '[REDACTED]',
        nested: {
          refresh_token: '[REDACTED]',
          note: 'keep this value',
        },
        items: [{ clientSecret: '[REDACTED]' }],
      },
    });
    expect(request.headers.authorization).toBe('Bearer header-secret');
    expect(request.body.password).toBe('body-password-secret');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('redacts common credential aliases while preserving non-secret token metadata', () => {
    const request = {
      hostname: 'localhost',
      ip: '127.0.0.1',
      method: 'POST',
      originalUrl: '/v1/example?csrf_token=query-csrf-secret',
      headers: {
        'x-auth-token': 'header-auth-secret',
      },
      body: {
        jwt: 'body-jwt-secret',
        credentials: 'body-credentials-secret',
        passwordConfirmation: 'body-confirmation-secret',
        tokenType: 'access',
      },
    } as unknown as Request;

    middleware.use(request, {} as Response, jest.fn());

    const logged = logger.log.mock.calls[0][0];
    expect(JSON.stringify(logged)).not.toMatch(/query-csrf-secret|header-auth-secret|body-jwt-secret|body-credentials-secret|body-confirmation-secret/);
    expect(logged.body.tokenType).toBe('access');
  });
});
