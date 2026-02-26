import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateActivityRecordRequestDto {
  @ApiProperty({ description: '활동 키' })
  @IsString()
  activityKey: string;

  @ApiProperty({ description: '활동 값' })
  @IsBoolean()
  activityValue: boolean;
}
