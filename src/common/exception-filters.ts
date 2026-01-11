import { ArgumentsHost, Catch, ExceptionFilter, HttpException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { MyLogger } from '@src/configs/logger/my-logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(protected readonly logger: MyLogger) {
    this.logger.setContext('GlobalExceptionFilter');
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const httpException = exception instanceof HttpException ? exception : new InternalServerErrorException();

    const { message, stack } = httpException;
    const status = httpException.getStatus();

    const method = status >= 500 ? 'error' : 'warn';
    this.logger[method]({ message, status }, stack);

    host
      .switchToHttp()
      .getResponse()
      .status(status)
      .json({
        message,
        ...(exception.getResponse() && { optionalInfo: exception.getResponse() }),
      });
  }
}

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  constructor(protected readonly logger: MyLogger) {
    this.logger.setContext('NotFoundExceptionFilter');
  }

  catch(_: any, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const { hostname, ip, method, url, headers, body } = http.getRequest();

    const exception = new NotFoundException(url as string);
    const { message, stack } = exception;
    this.logger.warn({ message, hostname, ip, method, url, headers, body }, stack);

    http.getResponse().status(404).json({ message });
  }
}
