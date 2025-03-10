import { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { MyLogger } from '@src/configs/logger/my-logger';
import definedException from '../common/exception/definition.exception';
import { MyHttpException } from '../common/exception/my-http.exception';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: MyLogger,
  ) {
    this.logger.setContext('AuthGuard');
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    const accessToken = request.cookies?.access_token || request.headers.authorization?.split('Bearer ')?.[1];
    if (!accessToken) {
      throw new MyHttpException(definedException.unauthorized, 'token required');
    }

    // let payload: Record<string, any>;
    // try {
    //   payload = await this.authService.verifyJwt(accessToken);
    // } catch (e) {
    //   this.logger.warn(e);
    //   throw new MyHttpException(definedException.unauthorized);
    // }

    // const user = await this.userService.getUser(payload.userId);
    // if (!user) {
    //   throw new MyHttpException(definedException.unauthorized);
    // }

    return true;
  }
}
