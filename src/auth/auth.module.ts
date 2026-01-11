import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BannedIp } from './entity/banned-ip.entity';
import { MyBcrypt } from '@src/common/utils/bcrypt';
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
  providers: [AuthService, MyBcrypt, FailedSigninAttemptCache, DiscardedTokenCache],
  exports: [AuthService],
})
export class AuthModule {}
