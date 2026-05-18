import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiOkResponsePaginated } from '@src/common/swagger-paginated-response';
import { AdminRoleType, AdminService } from './admin.service';

import { toInstance } from '@src/common/utils/toInstance';
import { AdminCreateDto, AdminUpdateDto, ChangePasswordDto } from './dto/admin-request.dto';
import { AdminDto } from './dto/admin-response.dto';
import { PaginationRequestDto } from '@src/common/common.dto';
import { RequireRole } from './decorator/require-role.decorator';
import { AdminId } from './decorator/admin.decorators';
import { Auth } from '@src/auth/decorator/auth.decorator';

@Controller('admins')
@ApiTags('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @RequireRole(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '관리자 생성' })
  @ApiOkResponse({ type: AdminDto })
  async createAdmin(@Body() createAdminDto: AdminCreateDto) {
    return toInstance(AdminDto, await this.adminService.registerAdmin(createAdminDto));
  }

  @Put(':id')
  @RequireRole(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '관리자 수정' })
  @ApiOkResponse({ type: AdminDto })
  async updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() updateAdminDto: AdminUpdateDto) {
    return toInstance(AdminDto, await this.adminService.updateAdmin(id, updateAdminDto));
  }

  @Patch(':id/password')
  @RequireRole(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '관리자 비밀번호 변경' })
  @ApiOkResponse({ type: Boolean })
  async changePassword(@Param('id', ParseIntPipe) id: number, @Body() changePasswordDto: ChangePasswordDto) {
    await this.adminService.changePassword(id, changePasswordDto.password);
    return true;
  }

  @Get()
  @RequireRole(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '관리자 조회' })
  @ApiOkResponsePaginated(AdminDto)
  async getAdmins(@Query() { limit, offset }: PaginationRequestDto, @Query() { status }: { status?: string }) {
    const [admins, count] = await this.adminService.getAdminList({ offset, limit, status });
    return { list: toInstance(AdminDto, admins), count };
  }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiOkResponse({ type: AdminDto })
  async getMe(@AdminId() id: number) {
    return toInstance(AdminDto, await this.adminService.getAdminOrThrow(id));
  }

  @Delete(':id')
  @RequireRole(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '관리자 삭제' })
  @ApiOkResponse({ type: Boolean })
  async deleteAdmin(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.removeAdmin(id);
    return true;
  }
}
