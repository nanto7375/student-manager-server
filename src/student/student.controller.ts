import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { toInstance } from '@src/common/utils/toInstance';
import { ChangeScheduleRequestDto, CreateNoteRequestDto, PatchStudentRequestDto, RegisterStudentRequestDto, UpdateNoteRequestDto } from './dto/student-request.dto';
import { ShortStudentDto, StudentNoteDto, StudentDto } from './dto/student-response.dto';

import { AdminRoleType } from '@src/admin/admin.service';
import { RequireRole } from '@src/admin/decorator/require-role.decorator';
import { Auth } from '@src/auth/decorator/auth.decorator';

import { StudentService } from './student.service';
import { PaginationRequestDto } from '@src/common/common.dto';
import { ApiOkResponsePaginated } from '@src/common/swagger-paginated-response';

@Controller('students')
@ApiTags('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiOperation({ summary: '학생 목록 조회' })
  @ApiOkResponsePaginated(ShortStudentDto)
  async getStudents(@Query() { limit, page }: PaginationRequestDto, @Query() { name, schoolLevel, dayOfWeek, status }: { name: string; schoolLevel: number; dayOfWeek: number; status?: string }) {
    // 조회 쿼리스트링 더 추가
    const [students, count] = await this.studentService.getStudents(
      { name, schoolLevel: +schoolLevel, dayOfWeek: +dayOfWeek, status }, //
      { limit: +limit, offset: (page - 1) * limit },
    );

    return { list: toInstance(ShortStudentDto, students), count };
  }

  @Get(':studentId')
  @ApiOperation({ summary: '학생 정보 조회' })
  @ApiOkResponse({ type: StudentDto })
  async getStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    const student = await this.studentService.getStudentOrThrow(studentId, { includeNotes: true, includeScheduleChangeReservations: true });
    return toInstance(StudentDto, student);
  }

  @Post()
  @RequireRole(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '학생 등록' })
  @ApiOkResponse({ type: StudentDto })
  async register(@Body() registerStudentRequestDto: RegisterStudentRequestDto) {
    const student = await this.studentService.register(registerStudentRequestDto);
    return toInstance(StudentDto, student);
  }

  @Post(':studentId/notes')
  @ApiOperation({ summary: '학생 노트 생성' })
  @ApiOkResponse({ type: StudentNoteDto })
  async createAssessmentRecord(@Body() { value, type }: CreateNoteRequestDto, @Param('studentId', ParseIntPipe) studentId: number) {
    // TODO: adminId
    const note = await this.studentService.createNote({ studentId, value, type, adminId: 1 });
    return toInstance(StudentNoteDto, note);
  }

  @Patch(':studentId')
  @RequireRole(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '학생 정보 수정' })
  @ApiOkResponse({ type: StudentDto })
  async updatePersonalInfo(@Param('studentId', ParseIntPipe) studentId: number, @Body() patchStudentRequestDto: PatchStudentRequestDto) {
    const student = await this.studentService.updatePersonalInfo({ studentId, studentDto: patchStudentRequestDto });
    return toInstance(StudentDto, student);
  }

  @Patch(':studentId/schedules/:scheduleId')
  @RequireRole(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '학생 스케줄 변경' })
  @ApiOkResponse({ type: StudentDto })
  async changeSchedule(
    @Param('studentId', ParseIntPipe) studentId: number, //
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() { dateForChange }: ChangeScheduleRequestDto,
  ) {
    const student = await this.studentService.changeSchedule({ studentId, scheduleId, dateForChange });
    return toInstance(StudentDto, student);
  }

  @Patch(':studentId/notes/:noteId')
  @ApiOperation({ summary: '학생 노트 업데이트' })
  @ApiOkResponse({ type: StudentNoteDto })
  async updateAssessment(
    @Param('studentId', ParseIntPipe) studentId: number, //
    @Param('noteId', ParseIntPipe) noteId: number,
    @Body() { value }: UpdateNoteRequestDto,
  ) {
    // TODO: adminId
    const note = await this.studentService.updateNote({ noteId, adminId: 1, studentId, value });
    return toInstance(StudentNoteDto, note);
  }

  @Delete(':studentId')
  @RequireRole(AdminRoleType.SUPER_ADMIN)
  @ApiOperation({ summary: '학생 삭제' })
  async deleteStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    await this.studentService.deleteStudent(studentId);
    return true;
  }

  @Delete(':studentId/notes/:noteId')
  @ApiOperation({ summary: '학생 노트 제거' })
  @ApiOkResponse({ type: Boolean })
  async deleteNote(@Param('studentId', ParseIntPipe) studentId: number, @Param('noteId', ParseIntPipe) noteId: number) {
    return await this.studentService.deleteNote(noteId);
  }
}
