import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminCreateDto } from './dto/admin-request.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { toInstance } from '@src/common/toInstance';
import { AdminDto } from './dto/admin-response.dto';
import { Auth } from '@src/auth/auth.decorator';
import { AdminRoleType } from './entity.ts/admin.entity';

@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @Auth(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '관리자 생성' })
  @ApiOkResponse({ type: AdminDto })
  async createAdmin(@Body() createAdminDto: AdminCreateDto) {
    return toInstance(AdminDto, await this.adminService.registerAdmin(createAdminDto));
  }
}
