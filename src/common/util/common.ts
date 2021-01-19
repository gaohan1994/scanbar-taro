import dayJs from "dayjs";

export function dateHelper(date: number): string {
  return dayJs(date).format("YYYY-MM-DD");
}

interface ConsoleUtilConfig {
  title: string;
  env?: string;
}

export class ConsoleUtil {
  private title: string;
  private env: string;
  constructor(options: ConsoleUtilConfig) {
    this.init(options);
  }

  public console = (...arg: any[]) => {
    if (this.env !== "production") {
      console.log(`---- ${this.title} ----`);
      console.log(arg);
    }
  };

  private init = (options: ConsoleUtilConfig) => {
    const { title, env } = options;
    this.title = title;
    this.env = env || "development";
  };
}

/**
 * @todo [返回该年份至今的所有月份]
 */
export function createMonth(year: number = 2020) {
  const now = new Date()
  const currentYear = now.getFullYear()
  let month: any[] = []
  while(currentYear - year >= 0) {
    const length = currentYear - year === 0 ? now.getMonth() + 1 : 12
    new Array( length ).fill('').filter((_, index) => {
      month.push({
        month: index + 1,
        monthStr: `${year}年${index + 1}月`,
        startDate: new Date(year, index, 1),
        endDate: new Date(year, index, getMonthEndDate(index, year))
      })
    })
    year++
  }
  return month;
}

export function getMonthEndDate(month: number, year: number) {
  switch (month + 1) {
    case 2: {
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
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

/**
 * 校验数字输入
 *
 * @author Ghan
 * @export
 * @param {string} input 用户输入的金额，
 * @returns {string} 返回最多2位小数的金额
 */
export function checkNumberInput(input: string) {
  const reg = /([0-9]+\.[0-9]{2})[0-9]*/;
  return input.replace(reg, "$1");
}


/**
 * 简易防抖
 */
export function debounce(fn,delay){
  var handle;
  return function(...args){
    clearTimeout(handle) 
    handle=setTimeout(function(){
      fn(...args)
    },delay)
  }
}