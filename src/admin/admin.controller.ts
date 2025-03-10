import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminCreateDto } from './dto/admin-request.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { toInstance } from '@src/common/toInstance';
import { AdminDto } from './dto/admin-response.dto';

@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: '관리자 생성' })
  @ApiOkResponse({ type: AdminDto })
  createAdmin(@Body() createAdminDto: AdminCreateDto) {
    return toInstance(AdminDto, this.adminService.registerAdmin(createAdminDto));
  }
}
