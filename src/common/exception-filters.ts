import { ArgumentsHost, Catch, ExceptionFilter, HttpException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { MyLogger } from '@src/configs/logger/my-logger';
import { MailService } from '@src/mail/mail.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    protected readonly logger: MyLogger,
    private readonly mailService: MailService,
  ) {
    this.logger.setContext('GlobalExceptionFilter');
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const httpException = exception instanceof HttpException ? exception : new InternalServerErrorException();
    if (httpException instanceof InternalServerErrorException) this.logger.error(exception);

    const { message, stack } = httpException;
    const status = httpException.getStatus();
    this.logger[status >= 500 ? 'error' : 'warn']({ message, status }, stack);

    if (status >= 500) {
      const req = host.switchToHttp().getRequest();
      this.mailService.sendErrorAlert({
        subject: `${req?.method ?? ''} ${req?.url ?? ''} - ${message}`,
        body: `[${new Date().toISOString()}]\n\nURL: ${req?.method} ${req?.url}\nMessage: ${message}\n\nStack:\n${stack ?? exception?.['stack'] ?? 'N/A'}`,
      });
    }

    host
      .switchToHttp()
      .getResponse()
      .status(status)
      .json({
        message,
        ...(exception.getResponse?.() && { optionalInfo: exception.getResponse() }),
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

    const { message, stack } = new NotFoundException(url as string);
    this.logger.warn({ message, hostname, ip, method, url, headers, body }, stack);

    http.getResponse().status(404).json({ message });
  }
}
