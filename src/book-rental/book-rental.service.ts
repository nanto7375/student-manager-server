import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { StudentService } from '@src/student/student.service';

@Injectable()
export class BookRentalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentService: StudentService,
  ) {}

  async borrowBook({ studentId, bookTitle }: { studentId: number; bookTitle: string }) {
    await this.studentService.getStudentOrThrow(studentId);
    return await this.prisma.bookRental.create({
      data: { student: { connect: { id: studentId } }, bookTitle },
    });
  }

  async returnBook(bookRentalId: number) {
    const bookRental = await this.findBookRentalOrThrow(bookRentalId);
    if (bookRental.returnedAt) throw new BadRequestException('이미 반납된 책입니다');

    await this.prisma.bookRental.update({ where: { id: bookRentalId }, data: { returnedAt: new Date() } });
    return true;
  }

  async recordBorrowedBookTitle(bookRentalId: number, bookTitle: string) {
    const bookRental = await this.findBookRentalOrThrow(bookRentalId);
    if (bookRental.returnedAt) throw new BadRequestException('이미 반납된 책입니다');

    return await this.prisma.bookRental.update({ where: { id: bookRentalId }, data: { bookTitle } });
  }

  private async findBookRentalOrThrow(id: number) {
    const bookRental = await this.prisma.bookRental.findUnique({ where: { id } });
    if (!bookRental) throw new NotFoundException('책 대여 기록을 찾을 수 없습니다');
    return bookRental;
  }
}
