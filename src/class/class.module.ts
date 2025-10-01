import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { ClassSchedule } from './entity/class-schedule.entity';
import { AuthModule } from '@src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ClassSchedule]), AuthModule],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
