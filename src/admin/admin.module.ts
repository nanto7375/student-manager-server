import { forwardRef, Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entity/admin.entity';
import { HashService } from '@src/common/utils/hash';
import { AuthModule } from '@src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), forwardRef(() => AuthModule)],
  controllers: [AdminController],
  providers: [AdminService, HashService],
  exports: [AdminService],
})
export class AdminModule {}
