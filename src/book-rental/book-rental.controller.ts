import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { toInstance } from '@src/common/utils/toInstance';
import { BorrowBookRequestDto, UpdateBookRentalRequestDto } from './dto/book-rental.request.dto';
import { BookRentalDto } from './dto/book-rental.response.dto';

import { BookRentalService } from './book-rental.service';

@ApiTags('book-rental')
@Controller('book-rentals')
export class BookRentalController {
  constructor(private readonly bookRentalService: BookRentalService) {}

  @Post()
  @ApiOperation({ summary: '도서 대출 기록 생성' })
  @ApiOkResponse({ type: BookRentalDto })
  async createBookRentalActivityRecord(@Body() { studentId, bookTitle }: BorrowBookRequestDto) {
    const bookRental = await this.bookRentalService.borrowBook({ studentId, bookTitle });
    return toInstance(BookRentalDto, bookRental);
  }

  @Patch(':bookRentalId')
  @ApiOperation({ summary: '대출 도서 정보 업데이트' })
  @ApiOkResponse({ type: BookRentalDto })
  async updateBookRentalActivityRecord(
    @Param('bookRentalId', ParseIntPipe) bookRentalId: number, //
    @Body() { bookTitle }: UpdateBookRentalRequestDto,
  ) {
    const bookRental = await this.bookRentalService.recordBorrowedBookTitle(bookRentalId, bookTitle);
    return toInstance(BookRentalDto, bookRental);
  }

  @Patch(':bookRentalId/return')
  @ApiOperation({ summary: '도서 반납 처리' })
  @ApiOkResponse({ type: Boolean })
  async returnBook(@Param('bookRentalId', ParseIntPipe) bookRentalId: number) {
    const result = await this.bookRentalService.returnBook(bookRentalId);
    return result;
  }
}
