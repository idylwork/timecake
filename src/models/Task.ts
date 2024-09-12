import Project from './Project';
import Time from './Time';

export interface TaskData {
  body: string;
  projectId?: string;
  startAt: Time;
  endAt: Time | null;
}

/**
 * タスク情報モデル
 */
export default class Task {
  /** タスク内容 */
  body: string;
  /** プロジェクト */
  projectId: string | undefined;
  /** 開始時間 */
  startAt: Time;
  /** 終了時間 */
  endAt: Time;

  constructor({ body, projectId = undefined, startAt, endAt = null }: TaskData) {
    this.body = body;
    this.projectId = projectId;
    this.startAt = startAt instanceof Time ? startAt : new Time(startAt);
    if (endAt) {
      this.endAt = endAt instanceof Time ? endAt : new Time(endAt);
    } else {
      this.endAt = startAt.toAdded(60);
    }
  }

  /** 所要時間 */
  get minutes(): number {
    return this.endAt.valueOf() - this.startAt.valueOf();
  }

  /**
   * IDが一致するプロジェクトを取得する
   * @param projects 検索対象のプロジェクトリスト
   */
  projectFrom(projects: Project[]): Project | null {
    return projects.find((project) => project.id === this.projectId) ?? null;
  }

  /**
   * データをオブジェクト化する
   * @returns
   */
  toObject() {
    return {
      ...this,
      startAt: this.startAt.toString(),
      endAt: this.endAt.toString(),
    };
  }
}
