import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {
    const adapter = new PrismaMariaDb({
      database: configService.get('SM_MYSQL_DB'),
      host: configService.get('SM_MYSQL_DB_HOST'),
      port: +configService.get('SM_MYSQL_DB_PORT'),
      user: configService.get('SM_MYSQL_DB_USER'),
      password: configService.get('SM_MYSQL_DB_PASSWORD'),
      connectionLimit: 5,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
