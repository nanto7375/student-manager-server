import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { ConfigService } from '@nestjs/config';
import { logger } from './configs/logger/winston-logger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Environment } from './configs/config.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { type NestExpressApplication } from '@nestjs/platform-express';

dayjs.extend(utc);
dayjs.extend(timezone);

const setSwagger = (app: NestExpressApplication, serverVersion: string) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Student Manager Server') //
    .setDescription('Student Manager API description')
    .setVersion('0.1.0')
    .addBearerAuth({ name: 'Authorization', type: 'http', scheme: 'Bearer', in: 'header' }, 'accessJWT')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`/v${serverVersion}`, app, swaggerDocument, { swaggerOptions: { defaultModelExpandDepth: 5, defaultModelsExpandDepth: 5 } });
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
    cors: true,
    logger: logger,
  });
  const configService = app.get(ConfigService);

  const serverVersion = configService.get('SM_SERVER_VERSION');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: serverVersion,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  if (configService.get('NAWS_ENV') !== Environment.Production) setSwagger(app, serverVersion);

  const port = configService.get('SM_PORT');
  await app.listen(port, () => {
    logger.log(`Server is running on: http://localhost:${port}/v${serverVersion}`);
  });
}
bootstrap();
