import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BannedIp } from './entity/banned-ip.entity';
import { HashService } from '@src/common/utils/hash';
import { AdminModule } from '@src/admin/admin.module';
import { FailedSigninAttemptCache } from './cache/failed-signin-attempt.cache';
import { DiscardedTokenCache } from './cache/discarded-token.cache';

@Module({
  imports: [
    JwtModule.register({}), //
    TypeOrmModule.forFeature([BannedIp]),
    AdminModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, HashService, FailedSigninAttemptCache, DiscardedTokenCache],
  exports: [AuthService],
})
export class AuthModule {}
