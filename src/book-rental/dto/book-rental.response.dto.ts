import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BookRentalDto {
  @ApiProperty({ description: 'id' })
  @Expose()
  id: number;

  @ApiProperty({ description: '학생 ID' })
  @Expose()
  studentId: number;

  @ApiProperty({ description: '책 제목', nullable: true })
  @Expose()
  bookTitle: string;

  @ApiProperty({ description: '대여일' })
  @Expose()
  borrowedAt: Date;

  @ApiProperty({ description: '반납일', required: false })
  @Expose()
  returnedAt: Date | null;

  @ApiProperty({ description: '수정일' })
  @Expose()
  updatedAt: Date;
}
