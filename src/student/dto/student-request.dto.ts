import { ApiProperty } from '@nestjs/swagger';
import { Gender, SchoolLevel } from '@src/common/constant/common.const';
import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { Nullable, Optional } from 'class-validator-extended';

export class RegisterStudentRequestDto {
  @ApiProperty({ description: '이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '수업 시간' })
  @IsNumber()
  classScheduleId: number;

  @ApiProperty({ description: '수업료' })
  @IsNumber()
  tuition: number;

  @ApiProperty({ description: '생년' })
  @IsString()
  birthYear: string;

  @ApiProperty({ description: '생월일', nullable: true })
  @Nullable()
  @IsString()
  birthDate: string;

  @ApiProperty({ description: '성별', nullable: true, enum: Gender })
  @Nullable()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: '전화번호', nullable: true })
  @Nullable()
  @IsString()
  phone: string;

  @ApiProperty({ description: '부모 전화번호', nullable: true })
  @Nullable()
  @IsString()
  parentPhone: string;

  @ApiProperty({ description: '학교명', nullable: true })
  @Nullable()
  @IsString()
  schoolName: string;

  @ApiProperty({ description: '학교 레벨', nullable: true, enum: SchoolLevel })
  @Nullable()
  @IsEnum(SchoolLevel)
  schoolLevel: SchoolLevel;

  @ApiProperty({ description: '등록일', nullable: true })
  @Nullable()
  @IsDate()
  registeredAt: Date;
}

export class PatchStudentRequestDto {
  @ApiProperty({ description: '수업 시간' })
  @Optional()
  @IsNumber()
  classScheduleId: number;

  @ApiProperty({ description: '수업료' })
  @Optional()
  @IsNumber()
  tuition: number;

  @ApiProperty({ description: '전화번호', nullable: true })
  @Optional()
  @IsString()
  phone: string;

  @ApiProperty({ description: '부모 전화번호', nullable: true })
  @Optional()
  @IsString()
  parentPhone: string;

  @ApiProperty({ description: '학교명', nullable: true })
  @Optional()
  @IsString()
  schoolName: string;

  @ApiProperty({ description: '학교 레벨', nullable: true })
  @Optional()
  @IsEnum(SchoolLevel)
  schoolLevel: SchoolLevel;
}
