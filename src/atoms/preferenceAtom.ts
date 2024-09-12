import { appDataDir } from '@tauri-apps/api/path';
import { Getter } from 'jotai';
import { Setter } from 'jotai/experimental';
import { atomWithStorage, useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import { DEFAULT_MINUTE_STEP, DEFAULT_OUTPUT_TEMPLATE, DEFAULT_TASK_SEPARATOR } from '../constants';
import { moveFilesInDir } from '../utils/file';

/**
 * データ保存先パスAtom
 */
export const storagePathAtom = atomWithStorage('storagePath', '', undefined, { getOnInit: true });

/**
 * 出力用テンプレートAtom
 */
export const outputTemplateAtom = atomWithStorage('outputTemplate', DEFAULT_OUTPUT_TEMPLATE);

/**
 * タスク区切り文字Atom
 */
export const taskSeparatorAtom = atomWithStorage('taskSeparator', DEFAULT_TASK_SEPARATOR);

/** タスク時間の刻み値 (分) */
export const MinuteStep = [15, 30, 60] as const;
export type MinuteStep = (typeof MinuteStep)[number];

/**
 * タスク時間単位Atom
 */
export const minuteStepAtom = atomWithStorage<MinuteStep>('minuteStep', DEFAULT_MINUTE_STEP);

/**
 * データファイルをディレクトリ移動する
 * @param prevStoragePath
 * @param storagePath
 * @returns 成否
 */
const moveStorageFile = async (prevStoragePath: string, storagePath: string) => {
  if (prevStoragePath === storagePath) return;
  moveFilesInDir(prevStoragePath, storagePath, { extensions: ['json'] });
};

/**
 * データファイルを移動してファイルパスの格納先を変更する
 * @param get
 * @param dateTask
 * @returns プロジェクト一覧
 */
export const useMoveStoragePathWithFile = () =>
  useAtomCallback(
    useCallback(async (get: Getter, set: Setter, storagePath: string) => {
      const prevStoragePath = get(storagePathAtom);
      moveStorageFile(prevStoragePath, storagePath);
      set(storagePathAtom, storagePath);
    }, [])
  );

/**
 * データファイルを移動してファイルパスの格納先を変更する
 * @param get
 * @param dateTask
 * @returns プロジェクト一覧
 */
export const useResetPreferences = () =>
  useAtomCallback(
    useCallback(async (get: Getter, set: Setter) => {
      // 出力用テンプレート
      set(outputTemplateAtom, DEFAULT_OUTPUT_TEMPLATE);
      // タスク区切り文字
      set(taskSeparatorAtom, DEFAULT_TASK_SEPARATOR);
      // タスク時間単位
      set(minuteStepAtom, DEFAULT_MINUTE_STEP);
      // データの保管先
      const prevStoragePath = get(storagePathAtom);
      const defaultStoragePath = await appDataDir();
      moveStorageFile(prevStoragePath, defaultStoragePath);
      set(storagePathAtom, defaultStoragePath);
    }, [])
  );
