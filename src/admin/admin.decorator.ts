import { createParamDecorator, ExecutionContext, PipeTransform } from '@nestjs/common';
import { Unauthorized } from '@src/common/exception/definition.exception';
import { AdminService } from './admin.service';

export const AdminId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (!request.adminId) throw new Unauthorized();
  return request.adminId;
});

export class AdminParsePipe implements PipeTransform {
  constructor(private readonly adminService: AdminService) {}

  async transform(value: any) {
    const admin = await this.adminService.getAdminOrThrow(value);
    return admin;
  }
}

// export const Admin = () => {
//   return applyDecorators(AdminId(AdminParsePipe));
// };
