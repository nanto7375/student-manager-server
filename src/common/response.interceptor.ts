import { map, Observable } from 'rxjs';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { MyLogger } from '@src/configs/logger/my-logger';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly logger: MyLogger) {
    this.logger.setContext('ResponseLog');
  }

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        this.logger.log({ method: req.method, url: req.url, duration: `${Date.now() - now}ms` });
        return { message: data };
      }),
    );
  }
}
