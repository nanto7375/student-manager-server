import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { type NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { logger } from './configs/logger/winston-logger';
import { Environment } from './configs/config.service';
import { MailService } from './mail/mail.service';
import { ValidationError } from 'class-validator';

const initSwagger = (app: NestExpressApplication, version: string) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Student Manager Server') //
    .setVersion(version)
    .addBearerAuth({ name: 'Authorization', type: 'http', scheme: 'Bearer', in: 'header' }, 'accessJWT')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`api`, app, swaggerDocument, { swaggerOptions: { defaultModelExpandDepth: 5, defaultModelsExpandDepth: 5 } });
};

const _throwBadRequestWithExplicitMessage = (errors: ValidationError[]) => {
  const extractMessages = (errors: ValidationError[], parent?: string): string[] =>
    errors.flatMap((error) => {
      const property = parent ? `${parent}.${error.property}` : error.property;
      if (error.constraints) {
        const target = error.target?.constructor?.name ?? 'Unknown';
        return [`[${target}]${property}: ${Object.values(error.constraints).join(', ')}`];
      }
      return error.children?.length ? extractMessages(error.children, property) : [];
    });
  return new BadRequestException(extractMessages(errors).join('\n'));
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: true, logger });

  const configService = app.get(ConfigService);
  const env = configService.get('SM_ENV');
  const isProd = env === Environment.Production;

  const corsOptions = {
    origin: isProd ? 'https://admin.leolibrary.store' : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    preflightContinue: false,
  };
  app.enableCors(corsOptions);

  const serverVersion = configService.get('SM_SERVER_VERSION');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: serverVersion,
  });
  if (!isProd) initSwagger(app, serverVersion);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => (isProd ? new BadRequestException() : _throwBadRequestWithExplicitMessage(errors)),
    }),
  );

  const port = configService.get('SM_PORT');
  await app.listen(port);
  logger.log(`Server is running on: http://localhost:${port}/v${serverVersion}`);

  const mailService = app.get(MailService);
  process.on('unhandledRejection', (reason: any) => {
    logger.error(`Unhandled Rejection: ${reason?.message ?? reason}`, reason?.stack);
    mailService.sendErrorAlert({ subject: 'Unhandled Rejection', body: `${reason?.message ?? reason}\n\nStack:\n${reason?.stack ?? 'N/A'}` });
  });
  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`, error.stack);
    mailService.sendErrorAlert({ subject: 'Uncaught Exception', body: `${error.message}\n\nStack:\n${error.stack ?? 'N/A'}` });
  });
}
bootstrap();
