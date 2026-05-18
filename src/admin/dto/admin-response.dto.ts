import { Expose } from 'class-transformer';
import { AdminRoleType } from '../admin.service';
import { ApiProperty } from '@nestjs/swagger';

export class AdminDto {
  @Expose()
  @ApiProperty({ description: 'id' })
  id: number;

  @Expose()
  @ApiProperty({ description: '이름' })
  name: string;

  @Expose()
  @ApiProperty({ description: '이메일' })
  email: string;

  @Expose()
  @ApiProperty({ description: '전화번호' })
  phone: string;

  @Expose()
  @ApiProperty({ enum: AdminRoleType, description: '관리자 권한' })
  role: AdminRoleType;

  @Expose()
  @ApiProperty({ description: '활성화 여부' })
  isActive: boolean;

  @Expose()
  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: '삭제일' })
  deletedAt: Date;
}

export class ShortAdminDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  isActive: boolean;
}
