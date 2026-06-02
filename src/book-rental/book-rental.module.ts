import { Module } from '@nestjs/common';
import { BookRentalController } from './book-rental.controller';
import { BookRentalService } from './book-rental.service';
import { StudentModule } from '@src/student/student.module';

@Module({
  imports: [StudentModule],
  controllers: [BookRentalController],
  providers: [BookRentalService],
})
export class BookRentalModule {}
