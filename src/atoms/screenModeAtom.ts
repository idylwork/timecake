import { atom } from 'jotai';

/**
 * 表示モード
 */
export const ScreenMode = {
  taskEditor: 'task',
  projectSetting: 'projectSetting',
  preference: 'preference',
} as const;
export type ScreenMode = (typeof ScreenMode)[keyof typeof ScreenMode];

/**
 * アプリケーションの表示モードAtom
 */
export const screenModeAtom = atom<ScreenMode>(ScreenMode.taskEditor);
