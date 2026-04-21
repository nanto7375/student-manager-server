import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BcryptService } from '@src/common/utils/bcrypt';
import { AdminModule } from '@src/admin/admin.module';
import { FailedSigninAttemptCache } from './cache/failed-signin-attempt.cache';
import { DiscardedTokenCache } from './cache/discarded-token.cache';

@Module({
  imports: [
    JwtModule.register({}), //
    AdminModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, BcryptService, FailedSigninAttemptCache, DiscardedTokenCache],
  exports: [AuthService],
})
export class AuthModule {}
