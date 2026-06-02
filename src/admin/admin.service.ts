import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { AdminCreateDto, AdminUpdateDto } from './dto/admin-request.dto';
import { BcryptService } from '@src/common/utils/bcrypt';
import { PaginationDto } from '@src/common/common.dto';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { Prisma } from '@src/generated/prisma/client';
import { Status } from '@src/common/constant/common.const';

export enum AdminRoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export const getAdminRoleLevel = (role: AdminRoleType) => {
  switch (role) {
    case AdminRoleType.SUPER_ADMIN:
      return 4;
    case AdminRoleType.ADMIN:
      return 3;
    case AdminRoleType.MANAGER:
      return 2;
    case AdminRoleType.STAFF:
      return 1;
    default:
      return 0;
  }
};

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  async registerAdmin(createAdminDto: AdminCreateDto) {
    const adminInDb = await this.prisma.admin.findUnique({ where: { email: createAdminDto.email, deletedAt: null } });
    if (adminInDb) throw new BadRequestException('이미 존재하는 관리자입니다.');

    const admin: Prisma.AdminCreateInput = {
      ...createAdminDto,
      password: await this.bcryptService.hash(createAdminDto.password),
    };
    return this.prisma.admin.create({ data: admin });
  }

  async updateAdmin(id: number, updateAdminDto: AdminUpdateDto) {
    await this.getAdminOrThrow(id);
    const data = {
      email: updateAdminDto.email,
      role: updateAdminDto.role,
      phone: updateAdminDto.phone,
    };
    return this.prisma.admin.update({ where: { id }, data });
  }

  async changePassword(id: number, password: string) {
    await this.getAdminOrThrow(id);
    const data = { password: await this.bcryptService.hash(password) };
    await this.prisma.admin.update({ where: { id }, data });
    return true;
  }

  async removeAdmin(id: number) {
    await this.getAdminOrThrow(id);
    const data = { deletedAt: new Date() };
    await this.prisma.admin.update({ where: { id }, data });
    return true;
  }

  async getAdminOrThrow(id: number) {
    const admin = await this.prisma.admin.findUnique({ where: { id, deletedAt: null } });
    if (!admin) throw new NotFoundException('존재하지 않는 관리자입니다.');
    delete admin.password;
    return admin;
  }

  async getAdminByEmailOrThrow(email: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email, deletedAt: null } });
    if (!admin) throw new NotFoundException('존재하지 않는 관리자입니다.');
    return admin;
  }

  async getAdminList({ offset, limit, status, sort }: PaginationDto & { status?: string }) {
    const [sortKey, sortOrder] = sort.split('-');
    const where = {
      ...(status && status === Status.ACTIVE && { deletedAt: null }),
    };
    const admins = await this.prisma.admin.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { [sortKey]: sortOrder as Prisma.SortOrder },
    });
    const count = await this.prisma.admin.count({ where });

    const sortedAdmins = admins.sort((a, b) => getAdminRoleLevel(b.role as AdminRoleType) - getAdminRoleLevel(a.role as AdminRoleType));
    return [sortedAdmins, count];
  }
}
