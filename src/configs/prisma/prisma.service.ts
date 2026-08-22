import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';

export const createMariaDbConfig = (configService: ConfigService) => ({
  database: configService.get('SM_MYSQL_DB'),
  host: configService.get('SM_MYSQL_DB_HOST'),
  port: +configService.get('SM_MYSQL_DB_PORT'),
  user: configService.get('SM_MYSQL_DB_USER'),
  password: configService.get('SM_MYSQL_DB_PASSWORD'),
  connectionLimit: 10,
  minimumIdle: 2,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  allowPublicKeyRetrieval: configService.get('SM_MYSQL_ALLOW_PUBLIC_KEY_RETRIEVAL') === true,
});

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {
    const adapter = new PrismaMariaDb(createMariaDbConfig(configService));
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
