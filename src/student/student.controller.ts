import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { toInstance } from '@src/common/utils/toInstance';
import { PatchStudentRequestDto, RegisterStudentRequestDto, UpdateNoteRequestDto } from './dto/student-request.dto';
import { ShortStudentDto, StudentNoteDto, StudentDto } from './dto/student-response.dto';

import { AdminRoleType } from '@src/admin/admin.service';
import { RequireRole } from '@src/admin/decorator/require-role.decorator';
import { Auth } from '@src/auth/decorator/auth.decorator';

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
    const student = await this.studentService.getStudentOrThrow(studentId, { includeNotes: true });
    console.log(student);
    return toInstance(StudentDto, student);
  }

  // @Get(':studentId/notes')
  // @ApiOperation({ summary: '학생 노트 목록 조회' })
  // @ApiOkResponse({ type: StudentNoteDto })
  // async getNotes(@Param('studentId', ParseIntPipe) studentId: number) {
  //   const notes = await this.studentService.getNotes(studentId);
  //   return toInstance(StudentNoteDto, notes);
  // }

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
  async createAssessmentRecord(@Body() { value, type }: UpdateNoteRequestDto, @Param('studentId', ParseIntPipe) studentId: number) {
    // TODO: adminId
    const note = await this.studentService.createAssessment({ studentId, value, type, adminId: 1 });
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

  @Delete(':studentId/notes/:noteId')
  @ApiOperation({ summary: '학생 노트 제거' })
  @ApiOkResponse({ type: Boolean })
  async deleteNote(@Param('studentId', ParseIntPipe) studentId: number, @Param('noteId', ParseIntPipe) noteId: number) {
    return await this.studentService.deleteNote(noteId);
  }
}
