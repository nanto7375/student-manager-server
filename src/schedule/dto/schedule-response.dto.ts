import { ApiProperty } from '@nestjs/swagger';
import { DateUtils } from '@src/common/utils/date';
import { Expose } from 'class-transformer';

export class LessonScheduleDto {
  @ApiProperty({ description: 'id' })
  @Expose()
  id: number;

  @ApiProperty({ description: '요일', enum: DateUtils.DayOfWeek })
  @Expose()
  dayOfWeek: typeof DateUtils.DayOfWeek;

  @ApiProperty({ description: '시작 시간: HHMM' })
  @Expose()
  startTime: string;

  @ApiProperty({ description: '종료 시간: HHMM' })
  @Expose()
  endTime: string;
}
