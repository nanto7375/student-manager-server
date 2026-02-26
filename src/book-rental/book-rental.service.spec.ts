import { Test, TestingModule } from '@nestjs/testing';
import { BookRentalService } from './book-rental.service';

describe('BookRentalService', () => {
  let service: BookRentalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookRentalService],
    }).compile();

    service = module.get<BookRentalService>(BookRentalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
