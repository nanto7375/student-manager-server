import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { AdminCreateDto, AdminUpdateDto } from './dto/admin-request.dto';
import { BcryptService } from '@src/common/utils/bcrypt';
import { PaginationDto } from '@src/common/common.dto';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { Prisma } from '@src/generated/prisma/client';

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
    const adminInDb = await this.prisma.admin.findUnique({ where: { email: createAdminDto.email } });
    if (adminInDb) throw new BadRequestException('이미 존재하는 관리자입니다.');

    const admin: Prisma.AdminCreateInput = {
      ...createAdminDto,
      password: await this.bcryptService.hash(createAdminDto.password),
    };
    return this.prisma.admin.create({ data: admin });
  }

  async updateAdmin(id: number, updateAdminDto: AdminUpdateDto) {
    const admin = await this.getAdminOrThrow(id);
    admin.isActive = updateAdminDto.isActive;
    admin.role = updateAdminDto.role;
    admin.phone = updateAdminDto.phone;

    return this.prisma.admin.update({ where: { id }, data: admin });
  }

  async removeAdmin(id: number) {
    const admin = await this.getAdminOrThrow(id);
    admin.deletedAt = new Date();
    return this.prisma.admin.update({ where: { id }, data: admin });
  }

  async getAdminOrThrow(id: number) {
    const admin = await this.prisma.admin.findUnique({ where: { id, deletedAt: null } });
    if (!admin) throw new NotFoundException('존재하지 않는 관리자입니다.');
    delete admin.password;
    return admin;
  }

  async getAdminByEmailOrThrow(email: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email, isActive: true, deletedAt: null } });
    if (!admin) throw new NotFoundException('존재하지 않는 관리자입니다.');
    return admin;
  }

  async getAdminList({ offset, limit }: PaginationDto) {
    const admins = await this.prisma.admin.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    const count = await this.prisma.admin.count();

    const sortedAdmins = admins.sort((a, b) => getAdminRoleLevel(b.role as AdminRoleType) - getAdminRoleLevel(a.role as AdminRoleType));
    return [sortedAdmins, count];
  }
}
