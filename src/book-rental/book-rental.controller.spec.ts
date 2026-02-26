import { Test, TestingModule } from '@nestjs/testing';
import { BookRentalController } from './book-rental.controller';

describe('BookRentalController', () => {
  let controller: BookRentalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookRentalController],
    }).compile();

    controller = module.get<BookRentalController>(BookRentalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
