import { Module } from '@nestjs/common';
import { TuitionPaymentController } from './tuition-payment.controller';
import { TuitionPaymentService } from './tuition-payment.service';

@Module({
  controllers: [TuitionPaymentController],
  providers: [TuitionPaymentService]
})
export class TuitionPaymentModule {}
