import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminRoleType } from '@src/admin/entity/admin.entity';
import { AdminEmail } from '@src/admin/decorator/admin.decorator';
import { StudentService } from './student.service';
import { ClassService } from '@src/class/class.service';

import { toInstance } from '@src/common/utils/toInstance';
import { now } from '@src/common/utils/etc';
import { PatchStudentRequestDto, RegisterStudentRequestDto } from './dto/student-request.dto';
import { StudentDto } from './dto/student-response.dto';
import { AdminLevel } from '@src/admin/decorator/admin-level.decorator';

@Controller('students')
@ApiTags('student')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly classService: ClassService,
  ) {}

  @Post()
  @AdminLevel(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '학생 등록' })
  @ApiOkResponse({ type: StudentDto })
  async registerStudent(@Body() studentDto: RegisterStudentRequestDto, @AdminEmail() adminEmail: string) {
    if (!studentDto.registeredAt) studentDto.registeredAt = now();

    const student = await this.studentService.registerStudent({
      studentDto,
      classSchedule: await this.classService.getClassScheduleOrThrow(studentDto.classScheduleId),
    });

    return toInstance(StudentDto, student);
  }

  @Patch(':id')
  @AdminLevel(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '학생 정보 수정' })
  @ApiOkResponse({ type: StudentDto })
  async patchStudent(@Param('id', ParseIntPipe) id: number, @Body() studentDto: PatchStudentRequestDto, @AdminEmail() adminEmail: string) {
    const student = await this.studentService.patchStudent({
      student: await this.studentService.getStudentOrThrow(id),
      studentDto,
      classSchedule: studentDto.classScheduleId ? await this.classService.getClassScheduleOrThrow(studentDto.classScheduleId) : undefined,
    });

    return toInstance(StudentDto, student);
  }
}
