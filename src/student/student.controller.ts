import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from '@src/auth/auth.decorator';
import { AdminRoleType } from '@src/admin/entity/admin.entity';
import { AdminEmail } from '@src/admin/admin.decorator';
import { StudentService } from './student.service';
import { ScheduleService } from '@src/schedule/schedule.service';

import { RegisterStudentRequestDto } from './dto/student-request.dto';
import { StudentDto } from './dto/student-response.dto';
import { toInstance } from '@src/common/utils/toInstance';

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
    const student = await this.studentService.registerStudent({
      studentDto,
      classSchedule: await this.scheduleService.getClassScheduleOrThrow(studentDto.classScheduleId),
    });
    return toInstance(StudentDto, student);
  }
}
