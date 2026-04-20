import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@src/auth/guard/auth.guard';
import { RoleGuard } from '../admin-role.guard';
import { AdminRoleType, getAdminRoleLevel } from '../admin.service';

export const REQUIRED_ROLE_LEVEL_KEY = 'required-role-level';

/**
 * 특정 권한 레벨 이상의 관리자만 접근 가능하도록 제한하는 데코레이터
 * JWT 인증과 권한 레벨 체크를 함께 수행
 *
 * @param role 최소 요구 권한 레벨
 *
 * @example
 * // ADMIN 이상만 접근 가능
 * @RequireRole(AdminRoleType.ADMIN)
 * async updateUser() {}
 *
 * // SUPER_ADMIN만 접근 가능
 * @RequireRole(AdminRoleType.SUPER_ADMIN)
 * async deleteUser() {}
 */
export const RequireRole = (role: AdminRoleType) => applyDecorators(ApiBearerAuth('accessJWT'), SetMetadata(REQUIRED_ROLE_LEVEL_KEY, getAdminRoleLevel(role)), UseGuards(AuthGuard, RoleGuard));
