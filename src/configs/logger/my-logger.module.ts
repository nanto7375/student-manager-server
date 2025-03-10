import { Global, Module } from '@nestjs/common';
import { MyLogger } from './my-logger';

// winston-logger에 세팅된 로거의 global di용 모듈
@Global()
@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class MyLoggerModule {}
