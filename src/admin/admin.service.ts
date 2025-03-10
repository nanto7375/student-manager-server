import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BadRequest, NotFound } from '@src/common/exception/definition.exception';
import { Admin } from './entity.ts/admin.entity';
import { AdminCreateDto } from './dto/admin-request.dto';
import { HashService } from '@src/common/utils/hash';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly hashService: HashService,
  ) {}

  async registerAdmin(createAdminDto: AdminCreateDto) {
    const adminInDb = await this.adminRepository.findOne({ where: { email: createAdminDto.email } });
    if (adminInDb) throw new BadRequest('이미 존재하는 관리자입니다.');

    const admin = Admin.of({
      ...createAdminDto,
      password: await this.hashService.hash(createAdminDto.password),
    });
    return this.adminRepository.save(admin);
  }

  async getAdminByEmailOrThrow(email: string) {
    const admin = await this.adminRepository.findOne({ where: { email, isActive: true } });
    if (!admin) throw new NotFound('존재하지 않는 관리자입니다.');
    return admin;
  }
}
