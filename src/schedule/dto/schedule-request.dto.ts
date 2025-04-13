import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from '@src/common/constant/date.const';
import { IsEnum, IsString } from 'class-validator';

export class RegisterScheduleRequestDto {
  @ApiProperty({ description: '요일', enum: DayOfWeek })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: '시작 시간: HHMM' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: '종료 시간: HHMM' })
  @IsString()
  endTime: string;
}
