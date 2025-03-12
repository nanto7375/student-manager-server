import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export type PaginationDto = {
  offset: number;
  limit: number;
};

export class PaginationRequestDto {
  @ApiPropertyOptional({ description: '한 페이지에 보여줄 데이터 수' })
  @Type(() => Number)
  limit: number = 20;

  @ApiPropertyOptional({ description: '페이지 번호' })
  @Type(() => Number)
  page: number = 1;

  get offset() {
    return (this.page - 1) * this.limit;
  }
}
