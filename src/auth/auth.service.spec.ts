import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '@src/admin/admin.service';
import { BcryptService } from '@src/common/utils/bcrypt';
import { CryptoService } from '@src/common/utils/crypto';
import { MyLogger } from '@src/configs/logger/my-logger';
import { DiscardedTokenCache } from './cache/discarded-token.cache';
import { FailedSigninAttemptCache } from './cache/failed-signin-attempt.cache';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: MyLogger, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: JwtService, useValue: {} },
        { provide: AdminService, useValue: {} },
        { provide: BcryptService, useValue: {} },
        { provide: CryptoService, useValue: {} },
        { provide: FailedSigninAttemptCache, useValue: {} },
        { provide: DiscardedTokenCache, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
