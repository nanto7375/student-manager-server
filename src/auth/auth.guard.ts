import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { Forbidden, Unauthorized } from '../common/exception/definition.exception';
import { MyLogger } from '@src/configs/logger/my-logger';
import { AuthService } from './auth.service';

import { ADMIN_LEVEL_KEY } from '@src/admin/admin-level.decorator';
import { getAdminRoleLevel } from '@src/admin/entity.ts/admin.entity';

type RequestWithAdminId = Request & { adminId: number };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: MyLogger,
    private readonly reflector: Reflector,
  ) {
    this.logger.setContext('AuthGuard');
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithAdminId>();

    const accessToken = request.cookies?.access_token;
    if (!accessToken) throw new Unauthorized();

    let payload: Record<string, any>;
    try {
      payload = await this.authService.verifyJwt(accessToken);
    } catch (e) {
      this.logger.warn(e);
      throw new Unauthorized();
    }
    request.adminId = payload.id;

    const approvedAdminLevel = this.reflector.get(ADMIN_LEVEL_KEY, context.getHandler());
    if (!approvedAdminLevel) return true;

    const myAdminLevel = getAdminRoleLevel(payload.role);
    if (myAdminLevel < approvedAdminLevel) throw new Forbidden();
    return true;
  }
}
