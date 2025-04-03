import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Forbidden, Unauthorized } from '@src/common/exception/definition.exception';
import { AuthenticatedRequest } from '../auth/guard/auth.guard';
import { AUTH_SKIP_KEY } from '@src/auth/decorator/auth-skip.decorator';
import { ADMIN_LEVEL_KEY } from '@src/admin/decorator/admin-level.decorator';
import { getAdminRoleLevel } from '@src/admin/entity/admin.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const authSkip = this.reflector.get(AUTH_SKIP_KEY, context.getHandler());
    if (authSkip) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.role) throw new Unauthorized();

    const approvedAdminLevel = this.reflector.get(ADMIN_LEVEL_KEY, context.getHandler());
    if (!approvedAdminLevel) return true;

    const myAdminLevel = getAdminRoleLevel(request.role);
    if (myAdminLevel < approvedAdminLevel) throw new Forbidden();
    return true;
  }
}
