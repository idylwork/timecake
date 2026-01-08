import UnitTotal from './UnitTotal';
import MonthTotal from './MonthTotal';

export interface MonthTaskData {
  year: number;
  monthTotals: MonthTotal[];
}

/**
 * 月別の集計データ
 */
export default class YearTotal extends UnitTotal {
  /** 年 */
  year: number;

  /**
   * タスク情報のない日を空データで埋めて時間の集計を行う
   * @constructor
   * @param params.year - 年
   * @param monthTasks - 一年分の月別タスク情報
   */
  constructor({ year, monthTotals }: MonthTaskData) {
    super();

    this.year = year;

    /** 月を添字とした月別集計 */
    const indexedMonthTotals: MonthTotal[] = []
    monthTotals.forEach((monthTotal) => {
      if (monthTotal.year === year) indexedMonthTotals[monthTotal.month] = monthTotal;
    });

    // 月別の時間集計
    for (let month = 1; month <= 12; month += 1) {
      const monthTotal = indexedMonthTotals[month];
      const minuteByProject = new Map();
      let total = 0;
      [...monthTotal.totalByProject]
        .forEach(([projectId, minute]) => {
          total += minute;
          minuteByProject.set(projectId, (minuteByProject.get(projectId) ?? 0) + minute);
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
    return this.year === date.getFullYear() ? date.getMonth() : -1;
  }
}
