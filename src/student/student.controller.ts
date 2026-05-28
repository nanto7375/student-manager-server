import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { toInstance } from '@src/common/utils/toInstance';
import { ChangeScheduleRequestDto, CreateNoteRequestDto, PatchStudentRequestDto, RegisterMakeupScheduleRequestDto, RegisterStudentRequestDto, UpdateNoteRequestDto } from './dto/student-request.dto';
import { ShortStudentDto, StudentNoteDto, StudentDto } from './dto/student-response.dto';

import { AdminRoleType } from '@src/admin/admin.service';
import { RequireRole } from '@src/admin/decorator/require-role.decorator';
import { Auth } from '@src/auth/decorator/auth.decorator';

import { StudentService } from './student.service';
import { PaginationRequestDto } from '@src/common/common.dto';
import { ApiOkResponsePaginated } from '@src/common/swagger-paginated-response';
import { AdminId } from '@src/admin/decorator/admin.decorators';

@Controller('students')
@ApiTags('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @RequireRole(AdminRoleType.MANAGER)
  @ApiOperation({ summary: '학생 목록 조회' })
  @ApiOkResponsePaginated(ShortStudentDto)
  async getStudents(@Query() { limit, page, sort }: PaginationRequestDto, @Query() { name, schoolLevel, dayOfWeek, status }: { name: string; schoolLevel: number; dayOfWeek: number; status?: string }) {
    const [students, count] = await this.studentService.getStudents(
      { name, schoolLevel: +schoolLevel, dayOfWeek: +dayOfWeek, status }, //
      { limit: +limit, offset: (page - 1) * limit, sort },
    );

    return { list: toInstance(ShortStudentDto, students), count };
  }

  @Get(':studentId')
  @RequireRole(AdminRoleType.MANAGER)
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
  @RequireRole(AdminRoleType.MANAGER)
  @ApiOperation({ summary: '학생 노트 생성' })
  @ApiOkResponse({ type: StudentNoteDto })
  async createAssessmentRecord(@AdminId() adminId: number, @Body() { value, type }: CreateNoteRequestDto, @Param('studentId', ParseIntPipe) studentId: number) {
    const note = await this.studentService.createNote({ studentId, value, type, adminId });
    return toInstance(StudentNoteDto, note);
  }

  @Post(':studentId/makeup')
  @RequireRole(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '보강 수업 등록' })
  @ApiOkResponse({ type: Boolean })
  async registerMakeupSchedule(
    @Param('studentId', ParseIntPipe) studentId: number, //
    @Body() { dateForMakeup, scheduleId, movedAt }: RegisterMakeupScheduleRequestDto,
  ) {
    await this.studentService.registerMakeupSchedule({ studentId, scheduleId, dateForMakeup, movedAt });
    return true;
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
    @Body() { scheduleId, dateForChange }: ChangeScheduleRequestDto,
  ) {
    const student = await this.studentService.changeSchedule({ studentId, scheduleId, dateForChange });
    return toInstance(StudentDto, student);
  }

  @Patch(':studentId/notes/:noteId')
  @RequireRole(AdminRoleType.MANAGER)
  @ApiOperation({ summary: '학생 노트 업데이트' })
  @ApiOkResponse({ type: StudentNoteDto })
  async updateAssessment(
    @Param('studentId', ParseIntPipe) studentId: number, //
    @Param('noteId', ParseIntPipe) noteId: number,
    @AdminId() adminId: number,
    @Body() { value }: UpdateNoteRequestDto,
  ) {
    const note = await this.studentService.updateNote({ noteId, adminId, studentId, value });
    return toInstance(StudentNoteDto, note);
  }

  @Delete(':studentId')
  @RequireRole(AdminRoleType.SUPER_ADMIN)
  @ApiOperation({ summary: '학생 삭제' })
  async deleteStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    await this.studentService.deleteStudent(studentId);
    return true;
  }

  @Patch(':studentId/notes/:noteId/status')
  @RequireRole(AdminRoleType.MANAGER)
  @ApiOperation({ summary: '학생 노트 상태 토글' })
  @ApiOkResponse({ type: Boolean })
  async toggleNoteStatus(@Param('studentId', ParseIntPipe) studentId: number, @Param('noteId', ParseIntPipe) noteId: number) {
    return await this.studentService.toggleNoteStatus(noteId);
  }
}
