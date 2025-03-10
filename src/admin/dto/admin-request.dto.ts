import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { AdminRoleType } from '../entity.ts/admin.entity';

export class AdminCreateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
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
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'id' })
  id: number;

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
