import { ApiProperty } from '@nestjs/swagger';
import { ShortAdminDto } from '@src/admin/dto/admin-response.dto';
import { SchoolLevel } from '@src/common/constant/common.const';
import { ScheduleDto } from '@src/schedule/dto/schedule-response.dto';
import { Expose, Transform, Type } from 'class-transformer';

class ScheduleChangeReservationDto {
  @ApiProperty({ description: '예약 id' })
  @Expose()
  id: number;

  @ApiProperty({ type: () => ScheduleDto, description: '변경 예약된 수업 시간' })
  @Expose()
  @Type(() => ScheduleDto)
  schedule: ScheduleDto;

  @ApiProperty({ description: '변경 예약일' })
  @Expose()
  date: Date;
}

export class ShortStudentDto {
  @ApiProperty({ description: '학생 id' })
  @Expose()
  id: number;

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

  @ApiProperty({ description: '전화번호: 010-1234-5678' })
  @Expose()
  phone: string;

  @ApiProperty({ description: '부모님 전화번호: 010-1234-5678' })
  @Expose()
  parentPhone: string;

  @ApiProperty({ description: '수업 시간 id' })
  @Expose()
  scheduleId: number;

  @ApiProperty({ type: () => ScheduleDto, description: '수업 시간' })
  @Expose()
  schedule: ScheduleDto;

  @ApiProperty({ type: () => ScheduleDto, description: '변경 예약된 수업 시간', nullable: true })
  @Expose({ name: 'scheduleChangeReservations' })
  @Transform(({ obj }) => obj.scheduleChangeReservations?.[0] ?? null)
  @Type(() => ScheduleChangeReservationDto)
  scheduleReserved: ScheduleChangeReservationDto | null;

  @ApiProperty({ description: '등록일' })
  @Expose()
  registeredAt: Date;

  @ApiProperty({ description: '퇴원일' })
  @Expose()
  deletedAt: Date;
}

export class StudentDto extends ShortStudentDto {
  @ApiProperty({ description: '노트 목록', type: () => [StudentNoteDto] })
  @Expose()
  @Type(() => StudentNoteDto)
  notes: StudentNoteDto[];
}

export class StudentNoteDto {
  @ApiProperty({ description: '평가 id' })
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  studentId: number;

  @ApiProperty()
  @Type(() => ShortAdminDto)
  @Expose()
  lastCommenter: ShortAdminDto;

  @ApiProperty()
  @Expose()
  value: string;

  @ApiProperty()
  @Expose()
  type: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
