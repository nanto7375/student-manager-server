import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Unauthorized } from '@src/common/exception/definition.exception';

export const AdminEmail = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (!request.email) throw new Unauthorized();
  return request.email;
});

export const AdminId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (!request.adminId) throw new Unauthorized();
  return request.adminId;
});
