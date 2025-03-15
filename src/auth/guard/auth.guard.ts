import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { TokenExpired, Unauthorized } from '../../common/exception/definition.exception';
import { MyLogger } from '@src/configs/logger/my-logger';
import { AuthService, TOKEN_EXPIRED_ERROR } from '../auth.service';
import { AdminRoleType } from '@src/admin/entity/admin.entity';
import { getFingerprint } from '@src/common/utils/etc';

export type AuthenticatedRequest = Request & { email: string; role: AdminRoleType };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: MyLogger,
  ) {
    this.logger.setContext('AuthGuard');
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const accessToken = request.cookies?.acc;
    if (!accessToken) throw new Unauthorized();

    let payload: Record<string, any>;
    try {
      payload = await this.authService.verifyToken({ token: accessToken, fingerprint: getFingerprint(request) });
    } catch (e) {
      if (e.message === TOKEN_EXPIRED_ERROR) throw new TokenExpired();
      this.logger.warn({ message: e.message, ip: request.ip });
      throw new Unauthorized();
    }

    request.email = payload.email;
    request.role = payload.role;
    return true;
  }
}
