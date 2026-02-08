import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { MyLogger } from '@src/configs/logger/my-logger';
import { AuthService, TOKEN_EXPIRED_ERROR } from '../auth.service';
import { AUTH_SKIP_KEY } from '../decorator/auth-skip.decorator';

import { AdminRoleType } from '@src/admin/admin.service';

export type AuthenticatedRequest = Request & { email: string; role: AdminRoleType; adminId: number };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly logger: MyLogger,
  ) {
    this.logger.setContext('AuthGuard');
  }

  async canActivate(context: ExecutionContext) {
    // const authSkip = this.reflector.get(AUTH_SKIP_KEY, context.getHandler());
    // if (authSkip) return true;

    // const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    // const accessToken = request.headers.authorization?.split(' ')[1];
    // if (!accessToken || accessToken === 'null') throw new TokenNotProvided();

    // let payload: Record<string, any>;
    // try {
    //   payload = await this.authService.verifyToken({ token: accessToken, fingerprint: this.authService.getFingerprint(request) });
    // } catch (e) {
    //   console.log(e);
    //   if (e.message === TOKEN_EXPIRED_ERROR) throw new TokenExpired();
    //   this.logger.warn({ message: e.message, ip: request.ip });
    //   throw new Unauthorized();
    // }

    // request.adminId = payload.adminId;
    // request.email = payload.email;
    // request.role = payload.role;
    return true;
  }
}
