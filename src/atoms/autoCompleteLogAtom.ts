import { atom } from 'jotai';
import { Getter, Setter } from 'jotai/experimental';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import { AUTO_COMPLETE_COUNT_BY_PROJECT, AUTO_COMPLETE_SPAN } from '../constants';
import DateTask from '../models/DateTask';
import { dateWithoutTime } from '../utils/Date';
import { readJSONFile } from '../utils/file';
import { storagePathAtom, taskSeparatorAtom } from './preferenceAtom';

/** オートコンプリートログ */
interface AutocompleteLogItem {
  value: string;
  date: string;
  index: number;
}

/** プロジェクト毎のオートコンプリートログ */
export type AutoCompleteLog = {
  date: Date;
  logs: { [projectId: string]: Map<string, AutocompleteLogItem> };
};

/**
 * プロジェクトID毎の直近のログ
 * currentDate 基準となっている日付
 */
export const autoCompleteLogAtom = atom<AutoCompleteLog>({ date: new Date(), logs: {} });

/**
 * オートコンプリート情報をファイルから読み込む
 * @param props.basePath - タスク情報を読み込むフォルダパス
 * @param props.taskSeparator
 * @returns
 */
export const useReadAutoCompleteLog = () =>
  useAtomCallback(
    useCallback(async (get: Getter, set: Setter) => {
      /** タスク区切り文字 */
      const taskSeparator = get(taskSeparatorAtom);
      /** データ保管先パス */
      const storagePath = get(storagePathAtom);

      const currentDate = dateWithoutTime();
      let dateTasks: DateTask[] = [];

      // 直近の複数ファイルを読み込む
      for (let i = -AUTO_COMPLETE_SPAN; i <= 0; i += 1) {
        const targetDate = new Date(currentDate);
        targetDate.setMonth(currentDate.getMonth() + i);
        const targetDateTask = new DateTask({ date: targetDate });

        const data = await readJSONFile(`${storagePath}/${targetDateTask.getLogFileName()}`);
        if (data instanceof Array) {
          data.forEach((datum) => dateTasks.push(new DateTask(datum)));
        }
      }

      // 最新のものからタスクを区切り文字で分割してプロジェクトID毎に分類
      const logs: { [projectId: string]: Map<string, AutocompleteLogItem> } = {};
      for (let i = dateTasks.length - 1; i >= 0; i -= 1) {
        const dateTask = dateTasks[i];
        const tasks = dateTask.tasks;
        let taskIndex = 0;
        for (let j = 0; j < tasks.length; j += 1) {
          const task = tasks[j];
          const date = dateTask.date;
          if (!task.projectId || !task.body) continue;

          const logMap = logs[task.projectId] ?? new Map();

          // プロジェクトがすでにログ最大数に達していたらスキップ
          if (logMap.size >= AUTO_COMPLETE_COUNT_BY_PROJECT) continue;

          for (const body of task.body.split(taskSeparator)) {
            logMap.set(body, { value: body, date, index: taskIndex });
            taskIndex += 1;

            // プロジェクトがログ最大数に達したらスキップ
            if (logMap.size >= AUTO_COMPLETE_COUNT_BY_PROJECT) break;
          }
          logs[task.projectId] = logMap;
        }
      }
      set(autoCompleteLogAtom, { date: currentDate, logs: logs });
    }, [])
  );

/**
 * オートコンプリート情報に追加する
 * @param autoCompleteLog - 更新するオートコンプリート情報
 * @param dateTask - 追加する日別タスク
 * @param options.taskSeparator - タスク分割文字
 * @returns
 */
export const appendAutoCompleteLog = (
  autoCompleteLog: AutoCompleteLog,
  dateTask: DateTask,
  { taskSeparator }: { taskSeparator: string }
): AutoCompleteLog => {
  const currentDate = dateWithoutTime();

  // ファイルから取得した時点と日付が変わっていなければ日別タスクのデータからログ追加 (削除はなし)
  const diffMonth = autoCompleteLog.date.getFullYear() * 12 + autoCompleteLog.date.getMonth() + 1 - (dateTask.getYear() * 12 + dateTask.getMonth());

  // ログ範囲内の日付であればオートコンプリートを更新する
  if (0 <= diffMonth && diffMonth <= AUTO_COMPLETE_SPAN) {
    return autoCompleteLog;
  }
  let index = 0;
  const newLogs = structuredClone(autoCompleteLog.logs);

  dateTask.tasks.forEach((task) => {
    const projectId = task.projectId;
    if (!projectId || !task.body) return;
    const logMap = newLogs[projectId];

    task.body.split(taskSeparator).forEach((taskBody) => {
      const logItems = [...logMap.values()];
      const lastLogItem = logItems[logItems.length - 1];

      if (dateTask.date >= lastLogItem.date) {
        logMap.delete(lastLogItem.value);
        logMap.set(taskBody, { value: taskBody, date: dateTask.date, index });
      }
      newLogs[projectId] = logMap;
      index += 1;
    });
  });

  return { date: currentDate, logs: newLogs };
};
