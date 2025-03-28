import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ScheduleDto {
  @ApiProperty({ description: 'id' })
  @Expose()
  id: number;

  @ApiProperty({ description: '요일' })
  @Expose()
  dayOfWeek: string;

  @ApiProperty({ description: '시작 시간' })
  @Expose()
  startTime: string;

  @ApiProperty({ description: '종료 시간' })
  @Expose()
  endTime: string;
}
