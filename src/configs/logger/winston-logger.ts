import 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as appRootPath from 'app-root-path';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../config.service';

const configService = new ConfigService();
const locale = configService.get('SM_LOCALE');
const TZ = configService.get('SM_TZ');
const isTest = configService.get('SM_ENV') === Environment.Test;
const { combine, timestamp, printf } = winston.format;
const logDir = appRootPath.path + '/logs';

const getDate = () => {
  const date = new Date();
  date.setHours(date.getHours() + 9);
  return date.toJSON().replace('T', ' ').replace('Z', '');
};
const timezone = () =>
  new Date().toLocaleString(locale, {
    timeZone: TZ,
  });
const consoleLogFormat = combine(timestamp({ format: timezone }), nestWinstonModuleUtilities.format.nestLike());
const filePrint = printf((info) => {
  return JSON.stringify({ info, krTimestamp: getDate() });
});
// nestWinstonModuleUtilities.format.nestLike(), winston.format.uncolorize()
const fileLogFormat = combine(timestamp({ format: timezone }), filePrint);

export const logger = WinstonModule.createLogger({
  level: configService.get('SM_LOG_LEVEL') || 'info',
  transports: [
    new winston.transports.Console({
      format: consoleLogFormat,
      silent: isTest,
    }),
    new winston.transports.DailyRotateFile({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: `${logDir}/info`,
      filename: `%DATE%.log`,
      maxFiles: 7,
      json: false,
      zippedArchive: false,
      format: fileLogFormat,
      silent: isTest,
    }),
    new winston.transports.DailyRotateFile({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: `${logDir}/error`,
      filename: `%DATE%.log`,
      maxFiles: 7,
      handleExceptions: true,
      json: false,
      zippedArchive: false,
      format: fileLogFormat,
      silent: isTest,
    }),
    new winston.transports.DailyRotateFile({
      level: 'warn',
      datePattern: 'YYYY-MM-DD',
      dirname: `${logDir}/warn`,
      filename: `%DATE%.log`,
      maxFiles: 7,
      json: false,
      zippedArchive: false,
      format: fileLogFormat,
      silent: isTest,
    }),
    new winston.transports.DailyRotateFile({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      dirname: `${logDir}/debug`,
      filename: `%DATE%.log`,
      maxFiles: 2,
      json: false,
      zippedArchive: false,
      format: fileLogFormat,
      silent: isTest,
    }),
  ],
});
