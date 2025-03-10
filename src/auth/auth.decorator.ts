import { applyDecorators, CanActivate, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { AdminRoleType } from '@src/admin/entity.ts/admin.entity';
import { AdminLevel } from '@src/admin/admin-level.decorator';

type ReturnCanActivateType = new (...args: any[]) => CanActivate;
export function Auth(adminType: AdminRoleType | ReturnCanActivateType | null = null, ...guards: ReturnCanActivateType[]) {
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
