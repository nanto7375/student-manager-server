import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const AdminEmail = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (!request.email) throw new UnauthorizedException();
  return request.email;
});

export const AdminId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (!request.adminId) throw new UnauthorizedException();
  return request.adminId;
});
