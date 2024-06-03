import { MinuteStep } from '../atoms/dateTaskState';
import { floorNumberUnit } from '../utils/number';
import Project from './Project';
import Task, { TaskData as TaskProps } from './Task';
import Time from './Time';

export interface DateTaskData {
  date: string | Date;
  tasks?: Task[] | TaskProps[];
}

/**
 * 日別のタスク情報モデル
 */
export default class DateTask {
  /** 日付文字列 YYYY-MM-DD */
  date: string;
  /** タスクリスト */
  tasks: Task[]

  constructor({ date, tasks = [] }: DateTaskData) {
    this.date = date instanceof Date ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}` : date;
    this.tasks = tasks[0] instanceof Task ? tasks as Task[] : tasks.map((task) => new Task(task));
  }

  /**
   * タスクを追加する
   * @param startAt
   * @returns
   */
  appendTask(startAt: Time) {
    this.tasks = [...this.tasks, new Task({ body: '', startAt: startAt, endAt: startAt })];
    return this;
  }

  /**
   * データ保存用のオブジェクトに変換する
   * @returns
   */
  toObject() {
    return {
      ...this,
      tasks: this.tasks.map((task) => task.toObject()),
    }
  }

  /**
   * 年を取得する
   */
  getYear() {
    return Number(this.date.split('-')[0]);
  }

  /**
   * 月を取得する
   */
  getMonth() {
    return Number(this.date.split('-')[1]);
  }

  /**
   * 日を取得する
   */
  getDate() {
    return Number(this.date.split('-')[2]);
  }

  /**
   * 合計時間を取得する
   * レンダリングに使用する
   * @returns 合計時間
   */
  get hours(): number {
    let minutes = 0;
    for (let i = 0; i < this.tasks.length; i += 1) {
      minutes += this.tasks[i].minutes
    }
    return floorNumberUnit(minutes / 60, 0.01);
  }

  /**
   * タスクをプロジェクトごとのグループにまとめる
   * @returns プロジェクト毎のタスクリスト
   */
  tasksByProject(): Task[][] {
    const tasksByProject = new Map<string, Task[]>([]);
    this.tasks.forEach((task) => {
      const key = task.projectId ?? '';
      const tasks = tasksByProject.get(key)
      if (tasks) {
        tasksByProject.set(key, [...tasks, task])
      } else {
        tasksByProject.set(key, [task])
      }
    });
    return [...tasksByProject.values()];
  }

  /**
   * 追加できるタスクか
   * 時間範囲を検証する
   *
   * @param task
   * @param excludedIndex 検証から除外するインデックス
   * @returns
   */
  validateTask(task: Task, excludedIndex: number = -1) {
    // 時間範囲が有効な範囲内か
    if (task.startAt.valueOf() < 0 || Time.MAX < task.endAt) return false;

    // 時間範囲の重複がないか
    return this.tasks.every((other, otherIndex) => {
      if (otherIndex === excludedIndex) return true;
      return task.startAt < other.startAt ? task.endAt <= other.startAt : other.endAt <= task.startAt;
    });
  }

  /**
   * 集計する
   * @returns
   */
  totalize(projects: Project[], { separator = '・', minuteStep = 30 }: { separator?: string, minuteStep?: MinuteStep } = {}) {
    let startAt: Time | null = null;
    let endAt: Time | null = null;
    let totalHours = 0;

    const projectsTotal = this.tasksByProject().flatMap((tasks) => {
      const project = projects.find((project) => project.id === tasks[0].projectId);
      if (!project) {
        return []
      }

      /** プロジェクトの合計時間 */
      let minutes = 0;
      /** プロジェクトの説明文種類 */
      let bodySet = new Set();
      tasks.forEach((task) => {
        minutes += task.minutes;
        if (task.body) {
          task.body.split(separator).forEach((bodyItem) => {
            bodySet.add(bodyItem);
          });
        }
        if (!startAt || task.startAt < startAt) {
          startAt = task.startAt
        }
        if (!endAt || task.endAt > endAt) {
          endAt = task.endAt
        }
      });

      const hours = floorNumberUnit(minutes, minuteStep) / 60;
      totalHours += hours;

      return { name: project.name, hours, description: [...bodySet].join(separator) }
    }).filter(Boolean);

    return {
      month: this.getMonth(),
      date: this.getDate(),
      startAt: `${startAt ?? '?:??'}`,
      endAt: `${endAt ?? '?:??'}`,
      projects: projectsTotal,
    };
  }
}
