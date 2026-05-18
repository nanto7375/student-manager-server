import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export type PaginationDto = {
  offset: number;
  limit: number;
  sort: string;
};

export class PaginationRequestDto {
  @ApiPropertyOptional({ description: '한 페이지에 보여줄 데이터 수' })
  @Transform(({ value }) => Number(value))
  limit: number = 20;

  @ApiPropertyOptional({ description: '페이지 번호' })
  @Transform(({ value }) => Number(value))
  page: number = 1;

  get offset() {
    return (this.page - 1) * this.limit;
  }

  @ApiPropertyOptional({ description: '정렬 기준', example: 'createdAt-desc' })
  @Transform(({ value }) => value ?? 'createdAt-desc')
  sort: string = 'createdAt-desc';
}
