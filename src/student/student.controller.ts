import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { toInstance } from '@src/common/utils/toInstance';
import { PatchStudentRequestDto, RegisterStudentRequestDto } from './dto/student-request.dto';
import { StudentDto } from './dto/student-response.dto';

import { AdminRoleType } from '@src/admin/admin.service';
import { AdminLevel } from '@src/admin/decorator/admin-level.decorator';

import { StudentService } from './student.service';

@Controller('students')
@ApiTags('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @ApiOperation({ summary: '학생 등록' })
  @ApiOkResponse({ type: StudentDto })
  async register(@Body() registerStudentRequestDto: RegisterStudentRequestDto) {
    const student = await this.studentService.register(registerStudentRequestDto);
    return toInstance(StudentDto, student);
  }

  @Patch(':studentId')
  @ApiOperation({ summary: '학생 정보 수정' })
  @ApiOkResponse({ type: StudentDto })
  async updatePersonalInfo(@Param('studentId', ParseIntPipe) studentId: number, @Body() patchStudentRequestDto: PatchStudentRequestDto) {
    const student = await this.studentService.updatePersonalInfo({ studentId, studentDto: patchStudentRequestDto });
    return toInstance(StudentDto, student);
  }
}
