import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TuitionPaymentController } from './tuition-payment.controller';
import { TuitionPaymentService } from './tuition-payment.service';
import { TuitionPayment } from './entity/tuition-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TuitionPayment])],
  controllers: [TuitionPaymentController],
  providers: [TuitionPaymentService],
})
export class TuitionPaymentModule {}
