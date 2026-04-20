import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const AdminId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (!request.adminId) throw new UnauthorizedException();
  return request.adminId;
});
