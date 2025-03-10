import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DatabaseDialect, Environment } from '../config.service';

@Injectable()
export class MySqlConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = this.configService.get('SM_ENV') === Environment.Production;
    const dbSync = this.configService.get('SM_DB_SYNC');
    return {
      type: DatabaseDialect.Mysql,
      database: this.configService.get('SM_MYSQL_DB'),
      username: this.configService.get('SM_MYSQL_DB_USER'),
      password: this.configService.get('SM_MYSQL_DB_PASSWORD'),
      host: this.configService.get('SM_MYSQL_DB_HOST'),
      port: +this.configService.get('SM_MYSQL_DB_PORT'),
      charset: 'utf8mb4_unicode_ci',
      entities: ['dist/**/*.entity{.ts,.js}'],
      poolSize: 5,
      synchronize: isProduction ? false : dbSync,
      logging: isProduction ? false : true,
      namingStrategy: new SnakeNamingStrategy(),
      logger: 'simple-console',
      timezone: 'Z',
    };
  }
}
