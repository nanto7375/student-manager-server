import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { AdminRoleType } from '../entity.ts/admin.entity';
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({ description: '이메일', nullable: true })
  email: string = '';

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  @ApiProperty({ description: '전화번호' })
  phone: string;

  @IsEnum(AdminRoleType)
  @IsNotEmpty()
  @ApiProperty({ description: 'role', enum: AdminRoleType })
  role: AdminRoleType;
}

export class AdminUpdateDto extends AdminCreateDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'id' })
  id: number;
}
