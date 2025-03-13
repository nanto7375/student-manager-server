import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { Unauthorized } from '../common/exception/definition.exception';
import { MyLogger } from '@src/configs/logger/my-logger';
import { AuthService } from './auth.service';
import { AdminRoleType } from '@src/admin/entity.ts/admin.entity';
import { getFingerprint } from '@src/common/utils/etc';

export type AuthenticatedRequest = Request & { adminId: number; role: AdminRoleType };

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
      payload = await this.authService.verifyJwt(accessToken);
      if (payload.fingerprint !== getFingerprint(request)) throw Error('fingerprint mismatch');
    } catch (e) {
      this.logger.warn({ message: e.message, ip: request.ip });
      throw new Unauthorized();
    }

    request.adminId = payload.id;
    request.role = payload.role;
    return true;
  }
}
