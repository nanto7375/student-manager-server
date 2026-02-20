import { now } from './etc';
import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

@Injectable()
export class DateService {
  constructor() {
    dayjs.extend(utc);
    dayjs.extend(timezone);
  }

  now() {
    return dayjs().toDate();
  }

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
