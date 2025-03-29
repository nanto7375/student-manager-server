import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from '@src/auth/auth.decorator';
import { AdminRoleType } from '@src/admin/entity/admin.entity';
import { AdminEmail } from '@src/admin/admin.decorator';
import { StudentService } from './student.service';
import { ScheduleService } from '@src/schedule/schedule.service';

import { toInstance } from '@src/common/utils/toInstance';
import { now } from '@src/common/utils/etc';
import { PatchStudentRequestDto, RegisterStudentRequestDto } from './dto/student-request.dto';
import { StudentDto } from './dto/student-response.dto';

@Controller('students')
@ApiTags('student')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly scheduleService: ScheduleService,
  ) {}

  @Post()
  @Auth(AdminRoleType.ADMIN)
  async registerStudent(@Body() studentDto: RegisterStudentRequestDto, @AdminEmail() adminEmail: string) {
    if (!studentDto.registeredAt) studentDto.registeredAt = now();

    const student = await this.studentService.registerStudent({
      studentDto,
      classSchedule: await this.scheduleService.getClassScheduleOrThrow(studentDto.classScheduleId),
    });

    return toInstance(StudentDto, student);
  }

  @Patch(':id')
  @Auth(AdminRoleType.ADMIN)
  async patchStudent(@Param('id', ParseIntPipe) id: number, @Body() studentDto: PatchStudentRequestDto, @AdminEmail() adminEmail: string) {
    const student = await this.studentService.patchStudent({
      student: await this.studentService.getStudentOrThrow(id),
      studentDto,
      classSchedule: studentDto.classScheduleId ? await this.scheduleService.getClassScheduleOrThrow(studentDto.classScheduleId) : undefined,
    });

    return toInstance(StudentDto, student);
  }
}
