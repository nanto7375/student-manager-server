import { Global, Module } from '@nestjs/common';
import { DateService } from './date';
import { BcryptService } from './bcrypt';
import { CryptoService } from './crypto';

@Global()
@Module({
  providers: [DateService, BcryptService, CryptoService],
  exports: [DateService, BcryptService, CryptoService],
})
export class UtilsModule {}
