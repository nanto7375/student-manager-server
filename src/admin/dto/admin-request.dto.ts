import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdminRoleType } from '../entity/admin.entity';
import { Nullable } from 'class-validator-extended';

export class AdminCreateDto {
  @ApiProperty({ description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: '이름' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name: string;

  @ApiProperty({ description: '이메일' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '전화번호' })
  @Nullable()
  @IsString()
  @IsPhoneNumber('KR')
  phone: string;

  @ApiProperty({ description: 'role', enum: AdminRoleType })
  @IsEnum(AdminRoleType)
  role: AdminRoleType;
}

export class AdminUpdateDto {
  @ApiProperty({ description: '전화번호' })
  @Nullable()
  @IsString()
  @IsPhoneNumber('KR')
  phone: string;

  @ApiProperty({ description: 'role', enum: AdminRoleType })
  @IsEnum(AdminRoleType)
  role: AdminRoleType;

  @ApiProperty({ description: '활성화 여부' })
  @IsBoolean()
  isActive: boolean;
}
