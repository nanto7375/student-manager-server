import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

const ACTIVITY_STATUSES = ['pending', 'completed', 'failed'] as const;
const MONTHLY_STATUSES = ['pending', 'participated', 'preview', 'completed', 'failed', 'none'] as const;

export class UpdateActivityRecordRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(ACTIVITY_STATUSES)
  attendance?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(ACTIVITY_STATUSES)
  report1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(ACTIVITY_STATUSES)
  report2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(MONTHLY_STATUSES)
  monthlyProject?: string;
}
