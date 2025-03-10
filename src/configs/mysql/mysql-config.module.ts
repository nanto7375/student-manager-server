import { Module } from '@nestjs/common';
import { MySqlConfigService } from './mysql-config.service';

@Module({
  providers: [MySqlConfigService],
  exports: [MySqlConfigService],
})
export class MySqlConfigModule {}
