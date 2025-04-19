import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { type NestExpressApplication } from '@nestjs/platform-express';

import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { logger } from './configs/logger/winston-logger';
import { Environment } from './configs/config.service';
import { BadRequest } from './common/exception/definition.exception';
import { ValidationError } from 'class-validator';

dayjs.extend(utc);
dayjs.extend(timezone);

const setSwagger = (app: NestExpressApplication, version: string) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Student Manager Server') //
    .setDescription('Student Manager API description')
    .setVersion(version)
    .addBearerAuth({ name: 'Authorization', type: 'http', scheme: 'Bearer', in: 'header' }, 'accessJWT')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`api`, app, swaggerDocument, { swaggerOptions: { defaultModelExpandDepth: 5, defaultModelsExpandDepth: 5 } });
};

const _throwBadRequestWithExplicitMessage = (errors: ValidationError[]) => {
  const messages = errors.map((error) => {
    const target = error.target.constructor.name;
    const property = error.property;
    const stringifiedConstraints = Object.values(error.constraints).join(', ');
    return `[${target}]${property}: ${stringifiedConstraints}`;
  });
  return new BadRequest(messages.join('\n'));
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      preflightContinue: false,
    },
    logger: logger,
  });

  const configService = app.get(ConfigService);
  const env = configService.get('SM_ENV');

  const serverVersion = configService.get('SM_SERVER_VERSION');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: serverVersion,
  });
  if (env !== Environment.Production) setSwagger(app, serverVersion);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => (env === Environment.Production ? new BadRequest() : _throwBadRequestWithExplicitMessage(errors)),
    }),
  );

  const port = configService.get('SM_PORT');
  await app.listen(port, () => {
    logger.log(`Server is running on: http://localhost:${port}/v${serverVersion}`);
  });
}
bootstrap();
