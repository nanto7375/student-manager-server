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

  format(date: Date, formatStr: string) {
    return this.dayjs(date).format(formatStr);
  }

  currentYearMonth() {
    return this.dayjs().format('YYYYMM');
  }

  startOfMonth(yearMonth: string) {
    return this.dayjs(yearMonth, 'YYYYMM').startOf('month');
  }

  // dayOfWeek: 0(일) ~ 6(토)
  getDatesInMonthCorrespondingToDayOfWeek({ yearMonth, dayOfWeek, startDay }: { yearMonth: string; dayOfWeek: number; startDay?: number }) {
    const result: string[] = [];

    // 시작 날짜 결정
    const startDate = startDay //
      ? this.dayjs(yearMonth + startDay.toString().padStart(2, '0'), 'YYYYMMDD')
      : this.startOfMonth(yearMonth);

    // startDate 이후 첫 번째 dayOfWeek 찾기 (startDate가 이미 해당 요일이면 그대로 사용)
    let current = startDate;
    while (current.day() !== dayOfWeek) {
      current = current.add(1, 'day');
    }

    // 해당 월 내에서 7일 간격으로 수집
    while (current.format('YYYYMM') === yearMonth) {
      result.push(current.format('YYYYMMDD'));
      current = current.add(7, 'day');
    }

    return result;
  }
}
