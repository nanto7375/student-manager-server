import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

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
  @IsString()
  monthlyProject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  monthlyPreview?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  monthlyReport?: boolean;
}
