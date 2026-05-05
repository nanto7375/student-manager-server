import { ApiProperty } from '@nestjs/swagger';
import { Gender, SchoolLevel } from '@src/common/constant/common.const';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { Nullable, Optional } from 'class-validator-extended';

export class RegisterStudentRequestDto {
  @ApiProperty({ description: '이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '수업 시간', nullable: true })
  @Nullable()
  @IsNumber()
  scheduleId: number;

  @ApiProperty({ description: '생년', nullable: true })
  @Nullable()
  @IsString()
  birthYear: string;

  @ApiProperty({ description: '생월일', nullable: true })
  @Nullable()
  @IsString()
  birthDate: string;

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

  @ApiProperty({ description: '학교 레벨 - 초, 중, 고', nullable: true, enum: SchoolLevel })
  @Nullable()
  @IsNumber()
  schoolLevel: number;

  @ApiProperty({ description: '학교 학년', nullable: true })
  @Nullable()
  @IsNumber()
  schoolGrade: number;

  @ApiProperty({ description: '비고', nullable: true })
  @Nullable()
  @IsString()
  note: string;
}

export class PatchStudentRequestDto {
  @ApiProperty({ description: '생년', nullable: true })
  @Nullable()
  @IsString()
  birthYear: string;

  @ApiProperty({ description: '생월일', nullable: true })
  @Nullable()
  @IsString()
  birthDate: string;

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

  @ApiProperty({ description: '학교 학년', nullable: true })
  @Nullable()
  @IsNumber()
  @Min(1)
  @Max(6)
  schoolGrade: number;
}

export class ChangeScheduleRequestDto {
  @ApiProperty()
  @IsString()
  @Nullable()
  dateForChange: string; // YYYYMMDD
}

export class CreateNoteRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ enum: ['assessment', 'parent-counseling', 'fixed-memo', 'temporary-memo'] })
  @IsEnum(['assessment', 'parent-counseling', 'fixed-memo', 'temporary-memo'])
  type: 'assessment' | 'parent-counseling' | 'fixed-memo' | 'temporary-memo';
}

export class UpdateNoteRequestDto {
  @ApiProperty()
  @IsString()
  value: string;
}
