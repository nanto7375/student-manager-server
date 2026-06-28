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

  @ApiProperty({ description: '출석 상태' })
  @Expose()
  attendance: string;

  @ApiProperty({ description: '감상문 상태' })
  @Expose()
  report1: string;

  @ApiProperty({ description: '주간 레오 상태' })
  @Expose()
  report2: string;

  @ApiProperty({ description: '월간 상태' })
  @Expose()
  monthlyProject: string;

  @ApiProperty({ description: '대출 중인 책 정보', required: false })
  @Type(() => BookRentalDto)
  @Expose()
  borrowedBook?: BookRentalDto;
}
