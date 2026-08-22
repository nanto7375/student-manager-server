import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { StudentService } from '@src/student/student.service';
import { BookRentalService } from './book-rental.service';

describe('BookRentalService', () => {
  let service: BookRentalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookRentalService, { provide: PrismaService, useValue: {} }, { provide: StudentService, useValue: {} }],
    }).compile();

    service = module.get<BookRentalService>(BookRentalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
