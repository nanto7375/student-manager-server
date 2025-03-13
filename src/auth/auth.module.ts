import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DiscardedToken } from './entity/discardedToken.entity';
import { BannedIp } from './entity/banned-ip.entity';
import { HashService } from '@src/common/utils/hash';
import { AdminModule } from '@src/admin/admin.module';
import { FailedSigninAttemptCache } from './failed-signin-attempt.cache';

@Module({
  imports: [
    JwtModule.register({}), //
    TypeOrmModule.forFeature([DiscardedToken, BannedIp]),
    AdminModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, HashService, FailedSigninAttemptCache],
  exports: [AuthService],
})
export class AuthModule {}
