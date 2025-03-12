import { applyDecorators, CanActivate, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { AdminRoleType } from '@src/admin/entity.ts/admin.entity';
import { AdminLevel } from '@src/admin/admin-level.decorator';

type ReturnCanActivateType = new (...args: any[]) => CanActivate;
export function Auth(adminType: AdminRoleType | ReturnCanActivateType | null = null, ...guards: ReturnCanActivateType[]) {
  // adminType이 guard인 경우
  if (typeof adminType === 'function') {
    return applyDecorators(
      ApiBearerAuth('accessJWT'), //
      UseGuards(AuthGuard, adminType, ...guards),
    );
  }
  // adminType이 AdminRoleType이거나 null인 경우
  return applyDecorators(
    ApiBearerAuth('accessJWT'), //
    adminType ? AdminLevel(adminType) : () => {},
    UseGuards(AuthGuard, ...guards),
  );
}
