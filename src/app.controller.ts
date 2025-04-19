import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { AuthSkip } from './auth/decorator/auth-skip.decorator';

// TODO: 글로벌 가드에 막힘
@Controller()
export class AppController {
  constructor() {}

  @Version(VERSION_NEUTRAL)
  @Get('health')
  @AuthSkip()
  healthCheck() {
    return 'OK';
  }
}
