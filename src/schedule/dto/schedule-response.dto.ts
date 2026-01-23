import { ApiProperty } from '@nestjs/swagger';
import { DateUtils } from '@src/common/utils/date';
import { Expose, Type } from 'class-transformer';

export class LessonDto {
  @ApiProperty({ description: 'id' })
  @Expose()
  id: number;

  @ApiProperty({ description: '코드' })
  @Expose()
  code: string;

  @ApiProperty({ description: '이름' })
  @Expose()
  name: string;
}

export class ScheduleDto {
  @ApiProperty({ description: 'id' })
  @Expose()
  id: number;

  @ApiProperty({ description: '요일', enum: DateUtils.DayOfWeek })
  @Expose()
  dayOfWeek: typeof DateUtils.DayOfWeek;

  @ApiProperty({ description: '수업' })
  @Type(() => LessonDto)
  @Expose()
  lesson: LessonDto;

  @ApiProperty({ description: '시작 시간: HHMM' })
  @Expose()
  startTime: string;

  @ApiProperty({ description: '종료 시간: HHMM' })
  @Expose()
  endTime: string;
}
