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

const setSwagger = (app: NestExpressApplication) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Student Manager Server') //
    .setDescription('Student Manager API description')
    .setVersion('0.1.0')
    .addBearerAuth({ name: 'Authorization', type: 'http', scheme: 'Bearer', in: 'header' }, 'accessJWT')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`api`, app, swaggerDocument, { swaggerOptions: { defaultModelExpandDepth: 5, defaultModelsExpandDepth: 5 } });
};

const _exceptionFactory = (errors: ValidationError[]) => {
  console.log('--------------------------------');
  errors.forEach((error) => {
    console.log({
      tartget: error.target.constructor.name,
      property: error.property,
      constraints: error.constraints,
    });
  });
  console.log('--------------------------------');
  return new BadRequest();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
    cors: true,
    logger: logger,
  });

  const configService = app.get(ConfigService);
  const env = configService.get('SM_ENV');
  if (env !== Environment.Production) setSwagger(app);

  const serverVersion = configService.get('SM_SERVER_VERSION');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: serverVersion,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => (env === Environment.Production ? new BadRequest() : _exceptionFactory(errors)),
    }),
  );

  const port = configService.get('SM_PORT');
  await app.listen(port, () => {
    logger.log(`Server is running on: http://localhost:${port}/v${serverVersion}`);
  });
}
bootstrap();
