import { Injectable, NestMiddleware } from '@nestjs/common';
import { MyLogger } from '@src/configs/logger/my-logger';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  constructor(private readonly logger: MyLogger) {
    this.logger.setContext('RequestLog');
  }

  use(request: Request, _: Response, next: NextFunction) {
    const { hostname, ip, method, originalUrl, headers, body } = request;
    this.logger.log({ hostname, ip, method, url: originalUrl, headers, body });
    next();
  }
}
