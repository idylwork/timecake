import Color from './Color';
import Project from './Project';

/**
 * 統計の単位
 */
export const DateUnit = {
  Year: 'year',
  Month: 'month',
} as const;
export type DateUnit = typeof DateUnit[keyof typeof DateUnit];

/**
 * 複数の日付や月からグラフ描画用の集計データを作成する
 */
export default class UnitTotal {
  /** 日付順の合計時間リスト(分) */
  minutes: number[];
  /** 日付順のプロジェクトID毎合計時間リスト(分) */
  minutesByProject: Map<string, number>[];
  /** 月全体での合計時間 */
  total: number;
  /** 月全体でのプロジェクトIDごとの合計 */
  totalByProject: Map<string, number>;
  /** 月全体での1日の最大時間 */
  max: number;
  /** 月全体でのプロジェクトIDごとの1日の最大時間 */
  maxByProject: Map<string, number>;

  /**
   * 集計データを初期化　
   * @constructor
   */
  constructor() {
      this.minutes = [];
      this.minutesByProject = [];
      this.total = 0;
      this.totalByProject = new Map();
      this.max = 0;
      this.maxByProject = new Map();
  }

  /**
   * 集計項目を追加してプロパティを更新
   * @param params.minuteByProject - 項目内のプロジェクトID毎の合計時間
   * @param params.total - 項目内の合計時間
  */
  addItem({ minuteByProject, total }: { minuteByProject: Map<string, number>, total: number }) {
      this.minutes.push(total);
      this.minutesByProject.push(minuteByProject);

      // 最大値への範囲
      if (total > this.max) this.max = total;
      minuteByProject.forEach((minute, projectId) => {
      const targetMinute = this.maxByProject.get(projectId);
      if (targetMinute === undefined || targetMinute < minute) this.maxByProject.set(projectId, minute);
      this.totalByProject.set(projectId, (this.totalByProject.get(projectId) ?? 0) + minute);
      this.total += minute;
      });
  }

  /**
   * プロジェクトカラーをキーとして集計時間を取得する
   * @param projects
   * @returns
   */
  minutesByProjectColor(projects: Project[]): Map<Color, number>[] {
      const projectColorMap = new Map(projects.map((project) => ([project.id, project.color])))
      return this.minutesByProject.map((minuteMap) => (
      new Map([...minuteMap].map(([projectId, minutes]) => [projectColorMap.get(projectId) ?? new Color(), minutes]))
      ));
  }

  /**
   * 特定のプロジェクトに絞って合計時間リストを取得する
   * @param projectId
   * @returns
   */
  filterByProject(projectId: string): number[] {
      return this.minutesByProject.map((minutes) => minutes.get(projectId) ?? 0);
  }

  /**
   * Dateを内包するインデックスを取得する
   * @param date 対象日付
   * @returns 配列インデックス (見つからなければ-1)
   */
  dateIndexOf(_: Date): number {
    return -1;
  }
}
