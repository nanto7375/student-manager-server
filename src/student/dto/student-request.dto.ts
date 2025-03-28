import { ApiProperty } from '@nestjs/swagger';
import { Gender, SchoolLevel } from '@src/common/constant/common.const';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class RegisterStudentRequestDto {
  @ApiProperty({ description: '이름' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  name: string;

  @ApiProperty({ description: '수업 시간' })
  @IsNumber()
  @IsNotEmpty()
  classScheduleId: number;

  @ApiProperty({ description: '수업료' })
  @IsNumber()
  @IsNotEmpty()
  @Min(100_000)
  tuition: number;

  @ApiProperty({ description: '생년' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(4)
  birthYear: string;

  @ApiProperty({ description: '생월일', nullable: true })
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  birthDate: string;

  @ApiProperty({ description: '성별', nullable: true })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: '전화번호', nullable: true })
  @IsString()
  @MinLength(12)
  @MaxLength(13)
  phone: string;

  @ApiProperty({ description: '부모 전화번호', nullable: true })
  @IsString()
  @MinLength(12)
  @MaxLength(13)
  parentPhone: string;

  @ApiProperty({ description: '학교명', nullable: true })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  schoolName: string;

  @ApiProperty({ description: '학교 레벨', nullable: true })
  @IsEnum(SchoolLevel)
  schoolLevel: SchoolLevel;

  @ApiProperty({ description: '등록일', nullable: true })
  @IsDate()
  registeredAt: Date;
}
