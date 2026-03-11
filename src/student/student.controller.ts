import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { toInstance } from '@src/common/utils/toInstance';
import { PatchStudentRequestDto, RegisterStudentRequestDto, UpdateAssessmentRequestDto } from './dto/student-request.dto';
import { ShortStudentDto, StudentAssessMentDto, StudentDto } from './dto/student-response.dto';

import { AdminRoleType } from '@src/admin/admin.service';
import { AdminLevel } from '@src/admin/decorator/admin-level.decorator';

import { StudentService } from './student.service';
import { PaginationRequestDto } from '@src/common/common.dto';

@Controller('students')
@ApiTags('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiOperation({ summary: '학생 등록' })
  @ApiOkResponse({ type: ShortStudentDto })
  async getStudents(@Query() { limit, offset, name }: PaginationRequestDto & { name: string }) {
    // 조회 쿼리스트링 더 추가
    const students = await this.studentService.getStudents({ name, limit, offset });
    return toInstance(ShortStudentDto, students);
  }

  @Post()
  @ApiOperation({ summary: '학생 등록' })
  @ApiOkResponse({ type: StudentDto })
  async register(@Body() registerStudentRequestDto: RegisterStudentRequestDto) {
    const student = await this.studentService.register(registerStudentRequestDto);
    return toInstance(StudentDto, student);
  }

  @Post(':studentId/assessments')
  @ApiOperation({ summary: '학생 평가 레코드 생성' })
  @ApiOkResponse({ type: StudentAssessMentDto })
  async createAssessmentRecord() {
    // TODO: adminId
    const assessment = await this.studentService.createAssessmentRecord(1);
    return toInstance(StudentAssessMentDto, assessment);
  }

  @Patch(':studentId')
  @ApiOperation({ summary: '학생 정보 수정' })
  @ApiOkResponse({ type: StudentDto })
  async updatePersonalInfo(@Param('studentId', ParseIntPipe) studentId: number, @Body() patchStudentRequestDto: PatchStudentRequestDto) {
    const student = await this.studentService.updatePersonalInfo({ studentId, studentDto: patchStudentRequestDto });
    return toInstance(StudentDto, student);
  }

  @Patch(':studentId/assessments/:assessmentId')
  @ApiOperation({ summary: '학생 평가 레코드 업데이트' })
  @ApiOkResponse({ type: StudentAssessMentDto })
  async updateAssessment(
    @Param('studentId', ParseIntPipe) studentId: number, //
    @Param('assessmentId', ParseIntPipe) assessmentId: number,
    @Body() { value }: UpdateAssessmentRequestDto,
  ) {
    // TODO: adminId
    const assessment = await this.studentService.updateAssessment({ assessmentId, adminId: 1, studentId, value });
    return toInstance(StudentAssessMentDto, assessment);
  }
}
