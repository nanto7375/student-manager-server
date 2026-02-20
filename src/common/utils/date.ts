import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

@Injectable()
export class DateService {
  private readonly dayjs: typeof dayjs;

  constructor() {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    this.dayjs = dayjs;
  }

  now() {
    return this.dayjs().toDate();
  }

  currentYearMonth() {
    return this.dayjs().format('YYYYMM');
  }

  startOfMonth(yearMonth: string) {
    return this.dayjs(yearMonth, 'YYYYMM').startOf('month');
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
