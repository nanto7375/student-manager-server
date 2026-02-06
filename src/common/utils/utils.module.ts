import { Global, Module } from '@nestjs/common';
import { DateUtil } from './date';
import { MyBcrypt } from './bcrypt';

@Global()
@Module({
  providers: [DateUtil, MyBcrypt],
  exports: [DateUtil, MyBcrypt],
})
export class UtilsModule {}
