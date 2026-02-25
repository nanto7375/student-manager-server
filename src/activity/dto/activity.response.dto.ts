import { ApiProperty } from '@nestjs/swagger';
import { StudentInActivityDto } from '@src/student/dto/student-response.dto';
import { Expose, Type } from 'class-transformer';

export class BookRentalDto {
  @ApiProperty({ description: 'id' })
  @Expose()
  id: number;

  @ApiProperty({ description: '학생 ID' })
  @Expose()
  studentId: number;

  @ApiProperty({ description: '책 제목', nullable: true })
  @Expose()
  bookTitle: string;

  @ApiProperty({ description: '대여일' })
  @Expose()
  borrowedAt: Date;

  @ApiProperty({ description: '반납일', required: false })
  @Expose()
  returnedAt: Date | null;

  @ApiProperty({ description: '수정일' })
  @Expose()
  updatedAt: Date;
}

export class ActivityRecordDto {
  @ApiProperty({ description: 'id' })
  @Expose()
  id: number;

  @ApiProperty({ description: '학생 id' })
  @Type(() => StudentInActivityDto)
  @Expose()
  student: StudentInActivityDto;

  @ApiProperty({ description: '날짜' })
  @Expose()
  date: string;

  @ApiProperty({ description: '대체 수업 여부' })
  @Expose()
  isMakeup: boolean;

  @ApiProperty({ description: '출석 여부' })
  @Expose()
  attendance: boolean;

  @ApiProperty({ description: '감상문 제출 여부' })
  @Expose()
  report1: boolean;

  @ApiProperty({ description: '주간 레오(과제2) 제출 여부' })
  @Expose()
  report2: boolean;

  @ApiProperty({ description: '월간 프로젝트 참여 여부' })
  @Expose()
  monthlyProject: boolean;

  @ApiProperty({ description: '월간 프로젝트 개요 제출 여부' })
  @Expose()
  monthlyPreview: boolean;

  @ApiProperty({ description: '월간 프로젝트 감상문 제출 여부' })
  @Expose()
  monthlyReport: boolean;

  @ApiProperty({ description: '대출 중인 책 정보', required: false })
  @Type(() => BookRentalDto)
  @Expose()
  borrowedBook?: BookRentalDto;
}
