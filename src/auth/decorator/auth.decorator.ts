import { applyDecorators, CanActivate, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../guard/auth.guard';
import { AdminRoleType } from '@src/admin/entity/admin.entity';
import { AdminLevel } from '@src/admin/decorator/admin-level.decorator';
import { RoleGuard } from '../../admin/admin-role.guard';

type ReturnCanActivateType = new (...args: any[]) => CanActivate;
type AuthDecorator = {
  (...guards: ReturnCanActivateType[]): any;
  (adminType: AdminRoleType | ReturnCanActivateType | null, ...guards: ReturnCanActivateType[]): any;
};
export const Auth: AuthDecorator = (adminType: AdminRoleType | ReturnCanActivateType | null, ...guards: ReturnCanActivateType[]) => {
  if (!adminType) {
    return applyDecorators(
      ApiBearerAuth('accessJWT'), //
      UseGuards(AuthGuard),
    );
  }

  // adminType이 guard인 경우
  if (typeof adminType === 'function') {
    return applyDecorators(
      ApiBearerAuth('accessJWT'), //
      UseGuards(AuthGuard, adminType, ...guards),
    );
  }

  // adminType이 AdminRoleType인 경우
  return applyDecorators(
    ApiBearerAuth('accessJWT'), //
    AdminLevel(adminType),
    UseGuards(AuthGuard, RoleGuard, ...guards),
  );
};
