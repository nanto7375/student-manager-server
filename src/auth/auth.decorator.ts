import { applyDecorators, CanActivate, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { AdminRoleType } from '@src/admin/entity.ts/admin.entity';
import { AdminLevel } from '@src/admin/admin-level.decorator';

export function Auth(adminType: AdminRoleType | (new (...args: any[]) => CanActivate) | null = null, ...guards: (new (...args: any[]) => CanActivate)[]) {
  if (typeof adminType === 'function') {
    return applyDecorators(
      ApiBearerAuth('accessJWT'), //
      UseGuards(AuthGuard, adminType, ...guards),
    );
  }
  return applyDecorators(
    ApiBearerAuth('accessJWT'), //
    adminType ? AdminLevel(adminType) : () => {},
    UseGuards(AuthGuard, ...guards),
  );
}
