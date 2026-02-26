import { BadRequestException, Injectable } from '@nestjs/common';
import { BookRentalRepository } from './book-rental.repository';
import { StudentService } from '@src/student/student.service';

@Injectable()
export class BookRentalService {
  constructor(
    private readonly bookRentalRepository: BookRentalRepository,
    private readonly studentService: StudentService,
  ) {}

  async borrowBook({ studentId, bookTitle }: { studentId: number; bookTitle: string }) {
    await this.studentService.getStudentOrThrow(studentId);
    const activeBorrow = await this.bookRentalRepository.findActiveByStudentId(studentId);
    if (activeBorrow) throw new BadRequestException('이미 대여 중인 책이 있습니다');

    return await this.bookRentalRepository.create({
      student: { connect: { id: studentId } },
      bookTitle,
    });
  }

  async returnBook(bookRentalId: number) {
    const bookRental = await this.bookRentalRepository.findOrThrow(bookRentalId);
    if (bookRental.returnedAt) throw new BadRequestException('이미 반납된 책입니다');

    await this.bookRentalRepository.returnBook(bookRentalId);
    return true;
  }

  async recordBorrowedBookTitle(bookRentalId: number, bookTitle: string) {
    const bookRental = await this.bookRentalRepository.findOrThrow(bookRentalId);
    if (bookRental.returnedAt) throw new BadRequestException('이미 반납된 책입니다');

    return await this.bookRentalRepository.update(bookRentalId, { bookTitle });
  }
}
