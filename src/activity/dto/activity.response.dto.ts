import { ApiProperty } from '@nestjs/swagger';
import { StudentInActivityDto } from '@src/student/dto/student-response.dto';
import { Expose, Type } from 'class-transformer';

export class ActivityRecordDto {
  @ApiProperty({ description: 'id' })
  @Expose()
  id: number;

  @ApiProperty({ description: '학생 id' })
  @Type(() => StudentInActivityDto)
  @Expose()
  student: StudentInActivityDto;

  @ApiProperty({ description: '수업 id' })
  @Expose()
  scheduleId: number;

  @ApiProperty({ description: '날짜' })
  @Expose()
  date: string;

  @ApiProperty({ description: '대체 수업 여부' })
  @Expose()
  isMakeup: boolean;

  @ApiProperty({ description: '출석 여부' })
  @Expose()
  attended: boolean;

  @ApiProperty({ description: '감상문 제출 여부' })
  @Expose()
  report: boolean;

  @ApiProperty({ description: '주간 레오(과제2) 제출 여부' })
  @Expose()
  report2: boolean;
}
