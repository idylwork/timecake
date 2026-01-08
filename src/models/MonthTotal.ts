import UnitTotal from './UnitTotal';
import DateTask from './DateTask';

export interface MonthTaskData {
  year: number;
  month: number;
  dateTasks: DateTask[];
}

/**
 * 月別の集計データ
 */
export default class MonthTotal extends UnitTotal {
  /** 年 */
  year: number;
  /** 月 */
  month: number;

  /**
   * タスク情報のない日を空データで埋めて時間の集計を行う
   * @constructor
   * @param params.year - 年
   * @param params.month - 月
   * @param dateTasks - 一ヶ月分の日別タスク情報
   */
  constructor({ year, month, dateTasks }: MonthTaskData) {
    super();

    this.year = year;
    this.month = month;

    /** 日付を添字とした日別タスク */
    const indexedDateTasks: DateTask[] = []
    dateTasks.forEach((dateTask) => {
      if (dateTask.getYear() === year && dateTask.getMonth() === month) indexedDateTasks[dateTask.getDate()] = dateTask;
    });

    // 日別の時間集計
    const targetDate = new Date(year, month - 1, 1);
    for (let date = 1; date <= 31; date += 1) {
      // 月が終わったらデータ採集終了
      targetDate.setDate(date);
      if (month !== targetDate.getMonth() + 1) break;

      const dateTask = indexedDateTasks[date];
      const minuteByProject = new Map<string, number>();
      let total = 0;
      dateTask?.tasks
        .forEach((task) => {
          total += task.minutes;
          const projectId = task.projectId ?? '';
          minuteByProject.set(projectId, (minuteByProject.get(projectId) ?? 0) + task.minutes);
        });

      this.addItem({ minuteByProject, total })
    }
  }

  /**
   * Dateを内包するインデックスを取得する
   * @param date 対象日付
   * @returns 配列インデックス (見つからなければ-1)
   */
  dateIndexOf(date: Date): number {
    return this.year === date.getFullYear() && this.month === date.getMonth() + 1 ? date.getDate() - 1 : -1;
  }
}
