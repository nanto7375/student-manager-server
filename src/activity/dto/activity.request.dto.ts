import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateActivityRecordRequestDto {
  @ApiProperty({ description: '출석 여부' })
  @IsBoolean()
  attended: boolean;

  @ApiProperty({ description: '감상문 제출 여부' })
  @IsBoolean()
  report1: boolean;

  @ApiProperty({ description: '주간 레오(과제2) 제출 여부' })
  @IsBoolean()
  report2: boolean;
}
