import { appDataDir } from '@tauri-apps/api/path';
import { Getter } from 'jotai';
import { Setter } from 'jotai/experimental';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import DateTask from '../models/DateTask';
import { dateWithoutTime } from '../utils/Date';
import { makeDir } from '../utils/file';
import { appendAutoCompleteLog, autoCompleteLogAtom, useReadAutoCompleteLog } from './autoCompleteLogAtom';
import { dateTaskAtom, isDateTaskChangedAtom, isDateTaskLoadingAtom, useProcessDateTaskFile } from './dateTaskAtom';
import { storagePathAtom, taskSeparatorAtom } from './preferenceAtom';
import { useReadProjectsFile } from './projectsAtom';

/**
 * 読み込みの必要なAtomを初期化
 * プロジェクトリストと設定をファイルから読み込み
 * @param get
 * @param dateTask
 * @returns プロジェクト一覧
 */
export const useInitializeAtoms = () => {
  /** プロジェクトリストのファイル読み込み */
  const readProjectsFile = useReadProjectsFile();
  /** オートコンプリート情報をファイル読み込み */
  const readAutoCompleteLog = useReadAutoCompleteLog();

  return useAtomCallback(
    useCallback(async (get: Getter, set: Setter) => {
      // データの保管先が未設定ならデフォルトを設定してフォルダを作成
      let storagePath = get(storagePathAtom);
      if (!storagePath) {
        storagePath = await appDataDir();
        set(storagePathAtom, storagePath);
      }
      await makeDir(storagePath);

      // プロジェクトリストをファイルから読み込み
      await readProjectsFile();

      // オートコンプリートログをファイルから読み込み
      await readAutoCompleteLog();

      set(isDateTaskLoadingAtom, false);
    }, [])
  );
};

/**
 * 日付を移動する
 * 編集中のタスクと付帯する情報を保存し、対象日付のデータを読み込む
 * @returns
 */
export const useChangeDateTask = () => {
  /** 日別タスクのファイル操作 */
  const processDateTaskFile = useProcessDateTaskFile();
  /** オートコンプリート情報をファイル読み込み */
  const readAutoCompleteLog = useReadAutoCompleteLog();

  /**
   * 日付を移動する
   * 編集中のタスクと付帯する情報を保存し、対象日付のデータを読み込む
   * @param date - 読み込みする日付 (省略時は読み込みしない)
   * @param prevDateTask - 書き込みする日付 (省略時は書き込みしない)
   * @returns
   */
  return useAtomCallback(
    useCallback(async (get: Getter, set: Setter, readDate?: DateTask | Date, writeDateTask?: DateTask | undefined) => {
      // 編集中の日別タスクを保存して対象日付を読み込み
      set(isDateTaskLoadingAtom, true);
      let newDateTask;
      if (readDate) {
        // 読み書き・読み込みのみ
        newDateTask = await processDateTaskFile({ write: writeDateTask, read: readDate });
      } else if (writeDateTask) {
        // 書き込みのみ
        newDateTask = await processDateTaskFile({ write: writeDateTask });
      } else {
        set(isDateTaskLoadingAtom, false);
        return;
      }
      set(dateTaskAtom, newDateTask);
      set(isDateTaskChangedAtom, false);
      set(isDateTaskLoadingAtom, false);

      if (writeDateTask) {
        // プロジェクトを使用順で並べ替え
        let projectIds: string[] = [];
        for (var i = writeDateTask.tasks.length - 1; i >= 0; i -= 1) {
          const task = writeDateTask.tasks[i];
          if (task.projectId) projectIds.push(task.projectId);
        }

        const currentDate = dateWithoutTime();
        const autoCompleteLog = get(autoCompleteLogAtom);
        const taskSeparator = get(taskSeparatorAtom);
        if (currentDate.getTime() !== autoCompleteLog.date.getTime()) {
          // 日付が変わっていたらオートコンプリートログをプロジェクトファイルを読み込み直す
          await readAutoCompleteLog();
        } else {
          // すでに読み込んでいる場合はメモリ上のデータを追加するのみ
          set(autoCompleteLogAtom, appendAutoCompleteLog(autoCompleteLog, writeDateTask, { taskSeparator }));
        }
      }
    }, [])
  );
};
