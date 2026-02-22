import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { toInstance } from '@src/common/utils/toInstance';
import { ActivityService } from './activity.service';
import { ActivityRecordDto, BookRentalDto } from './dto/activity.response.dto';
import { BorrowBookRequestDto, UpdateActivityRecordRequestDto } from './dto/activity.request.dto';

@ApiTags('activity')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: '일일 활동 기록 조회' })
  @ApiOkResponse({ type: [ActivityRecordDto] })
  async getActivityRecords(@Query('scheduleId', ParseIntPipe) scheduleId: number, @Query('date') date: string) {
    const activityRecords = await this.activityService.getDailyActivityRecords({ scheduleId, date });
    return toInstance(ActivityRecordDto, activityRecords);
  }

  @Post('book-rentals')
  @ApiOperation({ summary: '도서 대출 기록 생성' })
  @ApiOkResponse({ type: ActivityRecordDto })
  async createBookRentalActivityRecord(@Body() { studentId, bookTitle }: BorrowBookRequestDto) {
    const activityRecord = await this.activityService.borrowBook({ studentId, bookTitle });
    return toInstance(ActivityRecordDto, activityRecord);
  }

  @Patch(':activityRecordId')
  @ApiOperation({ summary: '일일 활동 기록 업데이트' })
  @ApiOkResponse({ type: ActivityRecordDto })
  async updateActivityRecord(
    @Param('activityRecordId', ParseIntPipe) activityRecordId: number, //
    @Body() updateActivityRecordRequestDto: UpdateActivityRecordRequestDto,
  ) {
    // TODO: adminId
    const activityRecord = await this.activityService.updateActivityRecord({
      activityRecordId,
      activityRecordDto: updateActivityRecordRequestDto,
      adminId: 1,
    });
    return toInstance(ActivityRecordDto, activityRecord);
  }

  @Patch(':activityRecordId/monthly-project')
  @ApiOperation({ summary: '월간 프로젝트 참여' })
  @ApiOkResponse({ type: ActivityRecordDto })
  async participateMonthlyProject(@Param('activityRecordId', ParseIntPipe) activityRecordId: number) {
    // TODO: adminId
    const activityRecord = await this.activityService.participateMonthlyProject(activityRecordId, { adminId: 1 });
    return toInstance(ActivityRecordDto, activityRecord);
  }

  @Patch('book-rentals/:bookRentalId/return')
  @ApiOperation({ summary: '도서 반납 처리' })
  @ApiOkResponse({ type: BookRentalDto })
  async returnBook(@Param('bookRentalId', ParseIntPipe) bookRentalId: number) {
    const bookRental = await this.activityService.returnBook(bookRentalId);
    return toInstance(BookRentalDto, bookRental);
  }
}
