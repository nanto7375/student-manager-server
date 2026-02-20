import { Global, Module } from '@nestjs/common';
import { DateService } from './date';
import { MyBcrypt } from './bcrypt';

@Global()
@Module({
  providers: [DateService, MyBcrypt],
  exports: [DateService, MyBcrypt],
})
export class UtilsModule {}
