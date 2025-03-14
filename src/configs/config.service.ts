import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsOptional, validateSync } from 'class-validator';

export enum DatabaseDialect {
  Mysql = 'mysql',
}

export enum Environment {
  Development = 'development',
  Production = 'production',
  Local = 'local',
  Test = 'test',
}

export class EnvironmentVariables {
  // Common
  @IsOptional()
  @IsIn([Environment.Development, Environment.Production, Environment.Local, Environment.Test])
  SM_ENV: Environment = Environment.Development;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  SM_PORT: number = 3000;

  @IsOptional()
  SM_LOG_LEVEL: 'error' | 'warn' | 'info' | 'verbose' | 'debug' = 'info';

  // Database Information
  SM_MYSQL_DB: string;

  SM_MYSQL_DB_USER: string;

  SM_MYSQL_DB_PASSWORD: string;

  SM_MYSQL_DB_HOST: string;

  SM_MYSQL_DB_PORT: number;

  SM_JWT_SECRET: string;

  SM_JWT_REFRESH_SECRET: string;

  @Type(() => String)
  @Transform(({ value }) => {
    return value
      .split(',')
      .map((v: string) => Number(v))
      .reduce((acc: number, curr: number) => acc * curr, 1);
  })
  SM_JWT_ACCESS_LIFETIME: number;

  @Type(() => String)
  @Transform(({ value }) => {
    return value
      .split(',')
      .map((v: string) => Number(v))
      .reduce((acc: number, curr: number) => acc * curr, 1);
  })
  SM_JWT_REFRESH_LIFETIME: number;

  @Type(() => String)
  @Transform(({ value }) => {
    return value
      .split(',')
      .map((v: string) => Number(v))
      .reduce((acc: number, curr: number) => acc * curr, 1);
  })
  SM_JWT_REFRESH_TOKEN_RENEWAL_PERIOD: number;

  // Timezone / Locale -> 서버별로 설정시 변경
  @IsOptional()
  SM_TZ: string = 'Asia/Seoul';
  @IsOptional()
  SM_LOCALE: string = 'ko-KR';

  @Type(() => String)
  @Transform(({ value }) => {
    if (value === 'true') return true;
    else return false;
  })
  @IsOptional()
  @IsBoolean()
  SM_DB_SYNC: boolean = false;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  SM_BYCRYPT_SALT: number;

  SM_REDIS_HOST: string;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  SM_REDIS_PORT: number;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  SM_SIGNIN_FAILED_ATTEMPTS_CLEAR_TTL: number;

  SM_S3_PUBLIC_ACCESS_KEY_ID = '';

  SM_S3_PUBLIC_SECRET_ACCESS_KEY = '';

  SM_S3_PRIVATE_ACCESS_KEY_ID = '';

  SM_S3_PRIVATE_SECRET_ACCESS_KEY = '';

  SM_S3_BUCKET = '';

  SM_S3_REGION = '';

  SM_FIREBASE_PROJECT_ID = '';

  SM_FIREBASE_PRIVATE_KEY = '';

  SM_FIREBASE_CLIENT_EMAIL = '';
}

export const validateConfig = (env: Record<string, any>) => {
  const envInstance = plainToInstance(EnvironmentVariables, env, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
    exposeUnsetFields: true,
  });

  validateSync(envInstance, {
    enableDebugMessages: true,
  });

  return envInstance;
};
