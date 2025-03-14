import { SetMetadata } from '@nestjs/common';
import { AdminRoleType, getAdminRoleLevel } from './entity/admin.entity';

export const ADMIN_LEVEL_KEY = 'admin-level';
export const AdminLevel = (adminType: AdminRoleType) => SetMetadata(ADMIN_LEVEL_KEY, getAdminRoleLevel(adminType));
