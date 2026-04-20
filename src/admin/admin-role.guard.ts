import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticatedRequest } from '../auth/guard/auth.guard';
import { AUTH_SKIP_KEY } from '@src/auth/decorator/auth-skip.decorator';
import { REQUIRED_ROLE_LEVEL_KEY } from '@src/admin/decorator/require-role.decorator';
import { getAdminRoleLevel } from '@src/admin/admin.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // AuthSkip 데코레이터가 있으면 권한 체크 생략
    const authSkip = this.reflector.getAllAndOverride<boolean>(AUTH_SKIP_KEY, [context.getHandler(), context.getClass()]);
    if (authSkip) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.role) throw new UnauthorizedException();

    const requiredLevel = this.reflector.getAllAndOverride<number>(REQUIRED_ROLE_LEVEL_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredLevel) return true;

    const currentLevel = getAdminRoleLevel(request.role);
    if (currentLevel < requiredLevel) throw new ForbiddenException('level-too-low');

    return true;
  }
}
