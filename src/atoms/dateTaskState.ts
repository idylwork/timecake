import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import DateTask, { DateTaskData } from '../models/DateTask';
import Project, { ProjectData } from '../models/Project';
import { atomWithStorage, selectAtom } from 'jotai/utils';

const projects: ProjectData[] = [
  { name: 'FvApp', color: '#ddddff' },
  { name: 'Fv抽選アプリ', color: '#ddffcc' },
];

/**
 * プロジェクトリストのストレージデータAtom
 */
const projectsDataAtom = atomWithStorage('projects', projects);

/**
 * プロジェクトリストAtom
 */
export const projectsAtom = atom(
  (get) => get(projectsDataAtom).map((projectData) => new Project(projectData)),
  (_, set, update: Project[]) => set(projectsDataAtom, update)
);

/**
 * 日別タスクのストレージデータAtom
 */
const dateTaskDataAtom = atomWithStorage<DateTaskData>('dateTask', {
  date: new Date(),
  tasks: []
});

/**
 * プロジェクトリストAtom
 */
export const dateTaskAtom = atom(
  (get) => new DateTask(get(dateTaskDataAtom)),
  (_, set, update: DateTask) => set(dateTaskDataAtom, update)
);

const dateTaskLogsDataAtom = atomWithStorage<DateTaskData[]>('dataTaskLogs', []);

/**
 * 日別タスクログリストAtom
 */
export const dateTaskLogsAtom = atom(
  (get) => {
    return new Map(get(dateTaskLogsDataAtom).map((dateTaskLogData) => {
      const dateTask = new DateTask(dateTaskLogData);
      return [dateTask.date, dateTask]
    }));
  },
  (get, set, update: Map<string, DateTask> | DateTask) => {
    // ログの更新
    if (update instanceof DateTask) {
      // DateTask単体が渡されたときは日付から判定して更新する
      const newDateTaskLogs = new Map(get(dateTaskLogsDataAtom).map((dateTaskLogData) => {
        const dateTask = new DateTask(dateTaskLogData);
        return [dateTask.date, dateTask];
      }));

      if (update.tasks.length) {
        newDateTaskLogs.set(update.date, update);
      } else {
        newDateTaskLogs.delete(update.date);
      }
      set(dateTaskLogsDataAtom, [...newDateTaskLogs.values()]);

      // 使用したプロジェクトの並び順更新
      const projects = get(projectsDataAtom).map((projectData) => new Project(projectData));
      const priorityMap = new Map();
      update.tasks.forEach((task, index) => {
        priorityMap.set(task.projectId, index);
      });
      set(projectsAtom, projects.sort((a, b) => (priorityMap.get(b.id) ?? -1) - (priorityMap.get(a.id) ?? -1)));
    } else {
      set(dateTaskLogsDataAtom, [...update.values()]);
    }
  }
);

/**
 * 表示モード
 */
export const ScreenMode = {
  taskEditor: 'task',
  projectSetting: 'projectSetting',
  preference: 'preference',
} as const;
export type ScreenMode = typeof ScreenMode[keyof typeof ScreenMode];

/**
 * アプリケーションの表示モードAtom
 */
export const screenModeAtom = atom<ScreenMode>(ScreenMode.taskEditor);

/**
 * 表示中タスクリストAtom
 */
export const tasksAtom = focusAtom(dateTaskAtom, (optic) => optic.prop('tasks'));


/**
 * 出力テンプレートAtom
 */
export const outputTemplateAtom = atomWithStorage('outputTemplate', '```\n【日報】{{month}}/{{date}} {{startAt}}-{{endAt}}\n'
+ '{{#projects}}\n'
+ '・{{name}} {{description}} {{hours}}h\n'
+ '{{/projects}}\n'
+ '＜コメント＞\n'
+ '```\n');

/**
 * タスク区切り文字
 */
export const taskSeparatorAtom = atomWithStorage('taskSeparator', '・');

export const MinuteStep = [15, 30, 60] as const;
export type MinuteStep = typeof MinuteStep[number];

/**
 * タスク時間単位
 */
export const minuteStepAtom = atomWithStorage<MinuteStep>('minuteStep', 30);

/**
 * プロジェクトID毎のタスク名Atom
 */
export const taskBodyLogsAtom = selectAtom(dateTaskLogsAtom, (dateTaskLogs): { [projectId: string]: string[] } => {
  /** @todo 件数が多くなった場合の処理を追加する */
  const bodySets: { [projectId: string]: Set<string> } = {}

  const dateTasks = [...dateTaskLogs.values()]
  for (let i = 0; i < dateTasks.length; i += 1) {
    const tasks = dateTasks[i].tasks;
    for (let j = 0; j < tasks.length; j += 1) {
      const task = tasks[j];
      if (!task.projectId || !task.body) continue;
      const bodySet = bodySets[task.projectId] ?? new Set();
      bodySet.add(task.body);
      bodySets[task.projectId] = bodySet;
    }
  }

  // 最新のタスクから指定のサイズまでの個数をプロジェクト毎に取得する
  const maxCountByProject = 3;
  return Object.fromEntries(Object.entries(bodySets).map(([projectId, bodySet]) => {
    const bodies: string[] = [];
    const bodySetValues = [...bodySet];
    for (var i = bodySetValues.length - 1; i >= 0 && bodies.length < maxCountByProject ; i--) {
      bodies.push(bodySetValues[i]);
    }
    return [projectId, bodies];
  }));
});
