import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Forbidden, ServerError, Unauthorized } from '@src/common/exception/definition.exception';
import { AuthenticatedRequest } from '../auth/guard/auth.guard';
import { ADMIN_LEVEL_KEY } from '@src/admin/admin-level.decorator';
import { getAdminRoleLevel } from '@src/admin/entity/admin.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.role) throw new Unauthorized();

    const approvedAdminLevel = this.reflector.get(ADMIN_LEVEL_KEY, context.getHandler());
    if (!approvedAdminLevel) throw new ServerError();

    const myAdminLevel = getAdminRoleLevel(request.role);
    if (myAdminLevel < approvedAdminLevel) throw new Forbidden();
    return true;
  }
}
