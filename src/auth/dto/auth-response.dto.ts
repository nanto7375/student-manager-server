import { ApiProperty } from '@nestjs/swagger';
import { AdminDto } from '@src/admin/dto/admin-response.dto';
import { Expose, Type } from 'class-transformer';

export class SigninResponseDto {
  @Expose()
  @Type(() => AdminDto)
  @ApiProperty({ description: '관리자 정보' })
  admin: AdminDto;

  @Expose()
  @ApiProperty({ description: '리프레시 토큰' })
  refreshToken: string;
}
