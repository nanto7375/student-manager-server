import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdminRoleType } from '../entity/admin.entity';

export class AdminCreateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @ApiProperty({ description: '비밀번호' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '이름' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: '이메일' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('KR')
  @ApiProperty({ description: '전화번호' })
  phone: string;

  @IsEnum(AdminRoleType)
  @IsNotEmpty()
  @ApiProperty({ description: 'role', enum: AdminRoleType })
  role: AdminRoleType;
}

export class AdminUpdateDto {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('KR')
  @ApiProperty({ description: '전화번호' })
  phone: string;

  @IsEnum(AdminRoleType)
  @IsNotEmpty()
  @ApiProperty({ description: 'role', enum: AdminRoleType })
  role: AdminRoleType;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ description: '활성화 여부' })
  isActive: boolean;
}
