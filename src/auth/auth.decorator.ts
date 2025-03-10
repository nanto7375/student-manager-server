import { applyDecorators, CanActivate, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

export function Auth(...guards: (new (...args: any[]) => CanActivate)[]) {
  return applyDecorators(ApiBearerAuth('accessJWT'), UseGuards(AuthGuard, ...guards));
}
