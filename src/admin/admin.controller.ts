import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Auth } from '@src/auth/auth.decorator';
import { ApiOkResponsePaginated } from '@src/common/swagger-paginated-response';
import { AdminService } from './admin.service';

import { toInstance } from '@src/common/utils/toInstance';
import { AdminCreateDto, AdminUpdateDto } from './dto/admin-request.dto';
import { AdminDto } from './dto/admin-response.dto';
import { AdminRoleType } from './entity/admin.entity';
import { PaginationRequestDto } from '@src/common/common.dto';

@Controller('admins')
@ApiTags('admin')
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
  @ApiOkResponsePaginated(AdminDto)
  async getAdmins(@Query() { limit, offset }: PaginationRequestDto) {
    const [admins, count] = await this.adminService.getAdminList({ offset, limit });
    return { data: toInstance(AdminDto, admins), count };
  }

  @Delete(':id')
  @Auth(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '관리자 삭제' })
  async deleteAdmin(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.removeAdmin(id);
  }
}
