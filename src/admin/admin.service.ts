import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Admin } from './entity/admin.entity';
import { AdminCreateDto, AdminUpdateDto } from './dto/admin-request.dto';
import { MyBcrypt } from '@src/common/utils/bcrypt';
import { PaginationDto } from '@src/common/common.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly myBcrypt: MyBcrypt,
  ) {}

  async registerAdmin(createAdminDto: AdminCreateDto) {
    const adminInDb = await this.adminRepository.findOne({ where: { email: createAdminDto.email } });
    if (adminInDb) throw new BadRequestException('이미 존재하는 관리자입니다.');

    const admin = Admin.of({
      ...createAdminDto,
      password: await this.myBcrypt.hash(createAdminDto.password),
    });
    return this.adminRepository.save(admin);
  }

  async updateAdmin(id: number, updateAdminDto: AdminUpdateDto) {
    const admin = await this.getAdminOrThrow(id);
    admin.isActive = updateAdminDto.isActive;
    admin.role = updateAdminDto.role;
    admin.phone = updateAdminDto.phone;

    return this.adminRepository.save(admin);
  }

  async removeAdmin(id: number) {
    const admin = await this.getAdminOrThrow(id);
    await this.adminRepository.softRemove(admin);
  }

  async getAdminOrThrow(id: number) {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('존재하지 않는 관리자입니다.');
    return admin.withoutPassword;
  }

  async getAdminByEmailOrThrow(email: string) {
    const admin = await this.adminRepository.findOne({ where: { email, isActive: true } });
    if (!admin) throw new NotFoundException('존재하지 않는 관리자입니다.');
    return admin;
  }

  async getAdminList({ offset, limit }: PaginationDto) {
    const [admins, count] = await this.adminRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const sortedAdmins = admins.sort((a, b) => b.roleLevel - a.roleLevel);
    return [sortedAdmins, count];
  }
}
