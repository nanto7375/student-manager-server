import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from '@src/common/constant/date.const';
import { Expose } from 'class-transformer';

export class ClassScheduleDto {
  @ApiProperty({ description: 'id' })
  @Expose()
  id: number;

  @ApiProperty({ description: '요일', enum: DayOfWeek })
  @Expose()
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: '시작 시간: HHMM' })
  @Expose()
  startTime: string;

  @ApiProperty({ description: '종료 시간: HHMM' })
  @Expose()
  endTime: string;
}
