import { ApiProperty } from '@nestjs/swagger';
import { Gender, SchoolLevel } from '@src/common/constant/common.const';
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

  @ApiProperty({ description: '성별' })
  @Expose()
  gender: Gender;

  @ApiProperty({ description: '전화번호: 010-1234-5678' })
  @Expose()
  phone: string;

  @ApiProperty({ description: '부모 전화번호' })
  @Expose()
  parentPhone: string;

  @ApiProperty({ description: '학교명' })
  @Expose()
  schoolName: string;

  @ApiProperty({ description: '학교 레벨' })
  @Expose()
  schoolLevel: SchoolLevel;

  @ApiProperty({ type: () => ScheduleDto, description: '수업 시간' })
  @Expose()
  classSchedule: ScheduleDto;

  @ApiProperty({ description: '수업료' })
  @Expose()
  tuition: number;

  @ApiProperty({ description: '등록일' })
  @Expose()
  registeredAt: Date;
}
