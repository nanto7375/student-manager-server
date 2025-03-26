import { Test, TestingModule } from '@nestjs/testing';
import { TuitionPaymentService } from './tuition-payment.service';

describe('TuitionPaymentService', () => {
  let service: TuitionPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TuitionPaymentService],
    }).compile();

    service = module.get<TuitionPaymentService>(TuitionPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
