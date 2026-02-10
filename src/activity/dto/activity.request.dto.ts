import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { Optional } from 'class-validator-extended';

export class UpdateActivityRecordRequestDto {
  @ApiProperty({ description: '출석 여부', required: false })
  @Optional()
  @IsBoolean()
  attended: boolean;

  @ApiProperty({ description: '감상문 제출 여부', required: false })
  @Optional()
  @IsBoolean()
  report1: boolean;

  @ApiProperty({ description: '주간 레오(과제2) 제출 여부', required: false })
  @Optional()
  @IsBoolean()
  report2: boolean;
}
