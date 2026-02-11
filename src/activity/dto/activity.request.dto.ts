import { ApiProperty } from '@nestjs/swagger';

export class UpdateActivityRecordRequestDto {
  @ApiProperty({ description: '활동 키' })
  activityKey: string;

  @ApiProperty({ description: '활동 값' })
  activityValue: boolean;
}
