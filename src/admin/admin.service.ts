import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Admin } from './entity.ts/admin.entity';
import { AdminCreateDto } from './dto/admin-request.dto';
import { BadRequest } from '@src/common/exception/definition.exception';

@Injectable()
export class AdminService {
  private readonly SALT: number;
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly configService: ConfigService,
  ) {
    this.SALT = this.configService.get('SM_BYCRYPT_SALT');
  }

  async registerAdmin(createAdminDto: AdminCreateDto) {
    const adminInDb = await this.adminRepository.findOne({ where: { phone: createAdminDto.phone } });
    if (adminInDb) throw new BadRequest('이미 존재하는 관리자입니다.');

    const admin = Admin.of({
      ...createAdminDto,
      password: await bcrypt.hash(createAdminDto.password, this.SALT),
    });
    return this.adminRepository.save(admin);
  }
}
