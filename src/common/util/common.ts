import dayJs from 'dayjs';

export function dateHelper(date: number): string {
  return dayJs(date).format('YYYY-MM-DD');
}

interface ConsoleUtilConfig {
  title: string;
  env?: string;
}

export class ConsoleUtil {
  private title: string;
  private env: string;
  constructor (options: ConsoleUtilConfig) {
    this.init(options);
  }

  public console = (...arg: any[]) => {
    if (this.env !== 'production') {
      console.log(`---- ${this.title} ----`);
      console.log(arg);
    }
  }
  
  private init = (options: ConsoleUtilConfig) => {
    const { title, env } = options;
    this.title = title;
    this.env = env || 'development';
  }

}

/**
 * @todo [计算一年的周]
 * @Author: Ghan 
 * @Date: 2020-01-15 15:41:35 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-02-25 11:09:09
 */
export function createWeeks(year: number = 2020) {
  let weeks: string[][] = [];
  /**
   * @param {ONE_DAY} number 一天的时间
   */
  const ONE_DAY = 1000 * 60 * 60 * 24;
  let start = new Date(year, 0, 1);
  let end = new Date(year, 11, 31);

  /**
   * 
   * @param {firstDay} 第一天的日期
   * @param {lastDay} 最后一天的日期
   */
  let firstDay = start.getDay() || 7;
  let lastDay = end.getDay() || 7;

  /**
   * @param {startTime} 每周的起始日期
   * @param {endTime} 每周的结束日期
   */
  let startTime = +start;
  let endTime = startTime + (7 - firstDay) * ONE_DAY;
  // @ts-ignore
  let _endTime = end - (7 - lastDay) * ONE_DAY;

  weeks.push([dateHelper(startTime), dateHelper(endTime)]);

  startTime = endTime + ONE_DAY;
  endTime = endTime + 7 * ONE_DAY;
  while (endTime < _endTime) {
    weeks.push([dateHelper(startTime), dateHelper(endTime)]);
    startTime = endTime + ONE_DAY;
    endTime = endTime + 7 * ONE_DAY;
  }
  weeks.push([dateHelper(startTime), dateHelper(+end)]);
  return weeks;
}

/**
 * @todo [返回该年份的所有月份]
 */
export function createMonth (year: number = 2020) {
  const month = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((item) => {
    return {
      month: item + 1,
      monthStr: `${year}年${item + 1}月`,
      startDate: new Date(year, item, 1),
      endDate: new Date(year, item, getMonthEndDate(item, year)),
    };
  });
  console.log('month', month);
  return month;
}

export function getMonthEndDate(month: number, year: number) {
  switch (month + 1) {
    case 2: {
      if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
        return 29;
      } else {
        return 28;
      }
    }
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12: {
      return 31;
    }
    default: {
      return 30;
    }
  }
}