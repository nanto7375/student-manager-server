import { Response } from 'express';
import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';

import { MyLogger } from '@src/configs/logger/my-logger';
import definedException from '@src/common/exception/definition.exception';
import { MyHttpException } from './exception/my-http.exception';
import { Throttle } from '@nestjs/throttler';

abstract class MyExceptionFilter implements ExceptionFilter {
  abstract catch(exception: any, host: ArgumentsHost): Response;

  respond(response: Response, exception: MyHttpException) {
    return response.status(exception.status).json({
      resultCode: exception.resultCode || 309999,
      resultMessage: exception.message || 'server error',
      optionalInfo: exception.optionalInfo,
    });
  }
}

@Catch()
export class GlobalExceptionFilter extends MyExceptionFilter {
  constructor(protected readonly logger: MyLogger) {
    super();
    this.logger.setContext('GlobalExceptionFilter');
  }

  catch(exception: MyHttpException, host: ArgumentsHost) {
    const myHttpException = exception instanceof MyHttpException ? exception : new MyHttpException(definedException.serverError, exception);

    const status = myHttpException.status;
    if (status >= 500) {
      this.logger.error({ message: exception.message, status: myHttpException.status, resultCode: myHttpException.resultCode }, exception.stack);
    } else {
      this.logger.warn({ message: exception.message, status: myHttpException.status, resultCode: myHttpException.resultCode }, exception.stack);
    }

    return this.respond(host.switchToHttp().getResponse(), myHttpException);
  }
}

@Catch(NotFoundException)
@Throttle({ default: { ttl: 1000, limit: 10 } })
export class NotFoundExceptionFilter extends MyExceptionFilter {
  constructor(protected readonly logger: MyLogger) {
    super();
    this.logger.setContext('NotFoundExceptionFilter');
  }

  catch(_: any, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const { hostname, ip, method, url, headers, body } = http.getRequest();

    const exception = new MyHttpException(definedException.notFound, url);
    this.logger.warn({ message: exception.message, hostname, ip, method, url, headers, body });

    return this.respond(http.getResponse(), exception);
  }
}
