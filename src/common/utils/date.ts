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

  getDatesInMonthCorrespondingToDayOfWeek({ yearMonth, dayOfWeek }: { yearMonth: string; dayOfWeek: number }) {
    const start = this.startOfMonth(yearMonth);
    const result: string[] = [];

    let current = start;
    while (current.day() !== dayOfWeek) {
      current = current.add(1, 'day');
    }
    while (current.format('YYYYMM') === yearMonth) {
      result.push(current.format('YYYYMMDD'));
      current = current.add(7, 'day');
    }
    return result;
  }
}
