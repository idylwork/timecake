import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import DateTask, { DateTaskData } from '../models/DateTask';
import Project, { ProjectData } from '../models/Project';
import { atomWithStorage } from 'jotai/utils';

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
export const displayModeAtom = atom<ScreenMode>(ScreenMode.taskEditor);

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
export const minuteStepAtom = atomWithStorage<MinuteStep>('minuteStep', 15);
