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

export class BorrowBookRequestDto {
  @ApiProperty({ description: '학생 ID' })
  @IsNumber()
  studentId: number;

  @ApiProperty({ description: '책 제목' })
  @IsOptional()
  @IsString()
  bookTitle?: string;
}
