import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { Forbidden } from '@src/common/exception/definition.exception';

@Injectable()
export class BannedIpGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const isBanned = await this.authService.isBannedIp(request.ip);
    if (isBanned) throw new Forbidden();
    return true;
  }
}
