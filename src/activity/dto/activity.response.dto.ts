import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BookRentalDto } from '@src/book-rental/dto/book-rental.response.dto';
import { StudentInActivityDto } from '@src/student/dto/student-response.dto';

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
  monthlyProject: Date | null;

  @ApiProperty({ description: '월간 프로젝트 개요 제출 여부' })
  @Expose()
  monthlyPreview: Date | null;

  @ApiProperty({ description: '월간 프로젝트 감상문 제출 여부' })
  @Expose()
  monthlyReport: Date | null;

  @ApiProperty({ description: '대출 중인 책 정보', required: false })
  @Type(() => BookRentalDto)
  @Expose()
  borrowedBook?: BookRentalDto;
}
