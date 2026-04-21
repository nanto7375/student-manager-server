import { forwardRef, Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BcryptService } from '@src/common/utils/bcrypt';
import { AuthModule } from '@src/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [AdminController],
  providers: [AdminService, BcryptService],
  exports: [AdminService],
})
export class AdminModule {}
