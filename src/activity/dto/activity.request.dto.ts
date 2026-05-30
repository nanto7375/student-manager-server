import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsOptional } from 'class-validator';

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
  @IsDate()
  monthlyProject?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  monthlyPreview?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  monthlyReport?: boolean;
}
