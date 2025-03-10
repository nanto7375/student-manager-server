import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Version(VERSION_NEUTRAL)
  @Get('health')
  healthCheck() {
    return 'OK';
  }
}
