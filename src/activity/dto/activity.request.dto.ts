import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateActivityRecordRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attendance?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  report1?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  report2?: boolean;
}

export class UpdateMonthlyActivityRecordRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  monthlyProject?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  monthlyPreview?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  monthlyReport?: boolean;
}
