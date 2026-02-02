import { ApiProperty } from '@nestjs/swagger';
import { SchoolLevel } from '@src/common/constant/common.const';
import { ScheduleDto } from '@src/schedule/dto/schedule-response.dto';
import { Expose } from 'class-transformer';

export class StudentDto {
  @ApiProperty({ description: '이름' })
  @Expose()
  name: string;

  @ApiProperty({ description: '생년: YYYY' })
  @Expose()
  birthYear: string;

  @ApiProperty({ description: '생월일: MMDD' })
  @Expose()
  birthDate: string;

  @ApiProperty({ description: '전화번호: 010-1234-5678' })
  @Expose()
  phone: string;

  @ApiProperty({ description: '부모님 전화번호: 010-1234-5678' })
  @Expose()
  parentPhone: string;

  @ApiProperty({ description: '학교명: 가나초등학교, 다라중학교, 마바고등학교' })
  @Expose()
  schoolName: string;

  @ApiProperty({ description: '학교 레벨', enum: SchoolLevel })
  @Expose()
  schoolLevel: SchoolLevel;

  @ApiProperty({ description: '학교 학년' })
  @Expose()
  schoolGrade: number;

  @ApiProperty({ description: '비고' })
  @Expose()
  note: string;

  @ApiProperty({ type: () => ScheduleDto, description: '수업 시간' })
  @Expose()
  schedule: ScheduleDto;

  @ApiProperty({ description: '등록일' })
  @Expose()
  registeredAt: Date;

  @ApiProperty({ description: '퇴원일' })
  @Expose()
  deletedAt: Date;
}

export class StudentInActivityDto {
  @ApiProperty({ description: '이름' })
  @Expose()
  name: string;

  @ApiProperty({ description: '생년: YYYY' })
  @Expose()
  birthYear: string;

  @ApiProperty({ description: '생월일: MMDD' })
  @Expose()
  birthDate: string;

  @ApiProperty({ description: '학교명: 가나초등학교, 다라중학교, 마바고등학교' })
  @Expose()
  schoolName: string;

  @ApiProperty({ description: '학교 레벨', enum: SchoolLevel })
  @Expose()
  schoolLevel: SchoolLevel;

  @ApiProperty({ description: '학교 학년' })
  @Expose()
  schoolGrade: number;
}
