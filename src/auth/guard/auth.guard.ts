import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { MyLogger } from '@src/configs/logger/my-logger';
import { AuthService } from '../auth.service';
import { AUTH_SKIP_KEY } from '../decorator/auth-skip.decorator';

import { AdminRoleType } from '@src/admin/admin.service';

export type AuthenticatedRequest = Request & { adminId: number; role: AdminRoleType };

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
    const authSkip = this.reflector.get(AUTH_SKIP_KEY, context.getHandler());
    if (authSkip) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken = request.headers.authorization?.split(' ')[1];
    if (!accessToken || accessToken === 'null') throw new UnauthorizedException();

    const payload = await this.authService.verify({ token: accessToken, fingerprint: this.authService.getFingerprint(request) });
    request.adminId = payload.adminId;
    request.role = payload.role;

    return true;
  }
}
