import { ApiProperty } from '@nestjs/swagger';
import { DateUtils } from '@src/common/utils/date';
import { IsEnum, IsString } from 'class-validator';

export class RegisterScheduleRequestDto {
  @ApiProperty({ description: '요일', enum: DateUtils.DayOfWeek })
  @IsEnum(DateUtils.DayOfWeek)
  dayOfWeek: typeof DateUtils.DayOfWeek;

  @ApiProperty({ description: '시작 시간: HHMM' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: '종료 시간: HHMM' })
  @IsString()
  endTime: string;
}
