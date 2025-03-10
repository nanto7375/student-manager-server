import { ConfigModule } from '@nestjs/config';

import { validateConfig } from './config.service';

export const ConfigDynamicModule = ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  validate: validateConfig,
});
