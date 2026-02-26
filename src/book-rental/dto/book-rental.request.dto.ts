import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class BorrowBookRequestDto {
  @ApiProperty({ description: '학생 ID' })
  @IsNumber()
  studentId: number;

  @ApiProperty({ description: '책 제목' })
  @IsOptional()
  @IsString()
  bookTitle?: string;
}

export class UpdateBookRentalRequestDto {
  @ApiProperty({ description: '책 제목' })
  @IsString()
  bookTitle: string;
}
