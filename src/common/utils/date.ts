import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';

@Injectable()
export class DateUtil {
  currentYearMonth() {
    return dayjs().format('YYYYMM');
  }
  startOfMonth(yearMonth: string) {
    return dayjs(yearMonth, 'YYYYMM').startOf('month');
  }
}
