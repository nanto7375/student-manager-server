import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminCreateDto, AdminUpdateDto } from './dto/admin-request.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { toInstance } from '@src/common/toInstance';
import { AdminDto } from './dto/admin-response.dto';
import { Auth } from '@src/auth/auth.decorator';
import { AdminRoleType } from './entity.ts/admin.entity';
import { getOffset } from '@src/common/utils/etc';

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

  @Put(':id')
  @Auth(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '관리자 수정' })
  @ApiOkResponse({ type: AdminDto })
  async updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() updateAdminDto: AdminUpdateDto) {
    return toInstance(AdminDto, await this.adminService.updateAdmin(id, updateAdminDto));
  }

  @Get()
  @Auth(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '관리자 조회' })
  @ApiOkResponse({ type: [AdminDto] })
  async getAdmins(@Query('limit') limit: number = 20, @Query('page') page: number = 1) {
    return toInstance(AdminDto, await this.adminService.getAdmins(limit, getOffset(page, limit)));
  }
}
