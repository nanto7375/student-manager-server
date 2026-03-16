import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
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
  @ApiOperation({ summary: '학생 목록 조회' })
  @ApiOkResponse({ type: ShortStudentDto })
  async getStudents(@Query() { limit, offset, name, schoolLevel, dayOfWeek }: PaginationRequestDto & { name: string; schoolLevel: number; dayOfWeek: number }) {
    // 조회 쿼리스트링 더 추가
    const students = await this.studentService.getStudents(
      { name, schoolLevel: +schoolLevel, dayOfWeek: +dayOfWeek }, //
      { limit: +limit, offset },
    );
    return toInstance(ShortStudentDto, students);
  }

  @Get(':studentId')
  @ApiOperation({ summary: '학생 정보 조회' })
  @ApiOkResponse({ type: StudentDto })
  async getStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    const student = await this.studentService.getStudentOrThrow(studentId);
    return toInstance(StudentDto, student);
  }

  @Get(':studentId/assessments')
  @ApiOperation({ summary: '학생 평가 목록 조회' })
  @ApiOkResponse({ type: StudentAssessMentDto })
  async getAssessment(@Param('studentId', ParseIntPipe) studentId: number) {
    const accessments = await this.studentService.getAssessments(studentId);
    return toInstance(StudentAssessMentDto, accessments);
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
  async createAssessmentRecord(@Body() { value }: UpdateAssessmentRequestDto, @Param('studentId', ParseIntPipe) studentId: number) {
    // TODO: adminId
    const assessment = await this.studentService.createAssessment({ studentId, value, adminId: 1 });
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

  @Delete(':studentId/assessments/:assessmentId')
  @ApiOperation({ summary: '학생 평가 레코드 제거' })
  @ApiOkResponse({ type: Boolean })
  async deleteAssessment(@Param('studentId', ParseIntPipe) studentId: number, @Param('assessmentId', ParseIntPipe) assessmentId: number) {
    return await this.studentService.deleteAssessment(assessmentId);
  }
}
