import { Injectable, PipeTransform } from '@nestjs/common';
import { AdminService } from './admin.service';

@Injectable()
export class AdminParsePipe implements PipeTransform {
  constructor(private readonly adminService: AdminService) {}

  async transform(value: number) {
    return this.adminService.getAdminOrThrow(value);
  }
}
