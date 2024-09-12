import { atom } from 'jotai';
import { atomWithStorage, useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import DateTask, { DateTaskData } from '../models/DateTask';
import Task from '../models/Task';
import Time from '../models/Time';
import { readJSONFile, writeJSONFile } from '../utils/file';
import { floorNumberUnit } from '../utils/number';
import { parseJSON, replaceMustache } from '../utils/string';
import { minuteStepAtom, outputTemplateAtom, storagePathAtom, taskSeparatorAtom } from './preferenceAtom';
import { projectsAtom } from './projectsAtom';

/**
 * 編集中日別タスクのローカルストレージAtom
 */
const dateTaskStorageAtom = atomWithStorage<DateTaskData>(
  'dateTask',
  {
    date: new Date(),
    tasks: [],
  },
  undefined,
  { getOnInit: true }
);

/**
 * 編集中日別タスクAtom
 * Storageに保持したデータをDateTaskインスタンスに変換して受け渡す
 */
export const dateTaskAtom = atom(
  (get) => {
    let data = get(dateTaskStorageAtom);
    if (typeof data === 'string') {
      data = parseJSON(data) ?? data;
    }
    return new DateTask(data);
  },
  (_, set, update: DateTask) => {
    set(isDateTaskChangedAtom, true)
    set(dateTaskStorageAtom, update)
  }
);

/**
 * 編集中日別タスク変更ステータスAtom
 */
export const isDateTaskChangedAtom = atomWithStorage('isChanged', false);

/**
 * ログファイルからDateTaskリストを取得する
 * ファイルがない
 * @param path
 * @returns
 */
const readDateTasks = async (path: string): Promise<DateTask[] | undefined> => {
  const data = await readJSONFile(path);
  if (data === '') return [];
  if (!(data instanceof Array)) return;

  return data?.map((dateTaskData) => new DateTask(dateTaskData));
};

/**
 * DateTaskをログファイルに記入する
 * タスクがひとつもない場合は日付ごと削除
 * 書き込みの前に最新のファイルを取得しなおす
 * @param path
 * @param dateTask
 * @returns 更新後の1ファイル分の日別タスク (失敗した場合はundefined)
 */
const writeDateTask = async (path: string, dateTask: DateTask): Promise<DateTask[] | undefined> => {
  let dateTasks: DateTask[] = [];
  // 対象ファイルがあれば読み込んで更新、なければ新規作成
  const oldDateTasks = await readDateTasks(path);
  if (!oldDateTasks) {
    console.error(`${path}はログファイルではありません。`);
    return;
  }
  dateTasks = oldDateTasks.sort((a, b) => (a.date > b.date ? 1 : -1));

  /** ファイルに書き込みするデータ */
  let newData: DateTaskData[] = [];
  /** 戻り値に使用する日別タスクリスト */
  const newDateTasks: DateTask[] = [];
  /** 挿入もしくは更新が完了しているか */
  let isUpdated = false;

  for (const oldDateTask of dateTasks) {
    if (!(oldDateTask instanceof DateTask)) {
      console.error(`${path}はログファイルではありません。`);
      return;
    }

    // 日付が同じか通り過ぎた時点で更新・挿入
    if (!isUpdated && oldDateTask.date >= dateTask.date) {
      isUpdated = true;
      if (dateTask.tasks.length) {
        newData.push(dateTask.toObject());
        newDateTasks.push(dateTask);
      }

      // 日付が同じ場合は挿入ではなく更新
      if (oldDateTask.date === dateTask.date) continue;
    }
    newData.push(oldDateTask.toObject());
    newDateTasks.push(oldDateTask);
  }
  // 最新の日付だった場合は最後尾に挿入
  if (!isUpdated && dateTask.tasks.length) {
    newData.push(dateTask.toObject());
    newDateTasks.push(dateTask);
  }

  if (newData.length) {
    await writeJSONFile(path, newData);
  }
  return newDateTasks;
};

/** 日別タスクファイルの更新アクションプロパティ */
interface DateTaskFileAction {
  write?: DateTask;
  read: DateTask;
}

/**
 * 日別タスクファイルの読み込みと書き込みを行う
 * 対象ファイル名はDateTimeインスタンスの日付から自動的に判別する
 * @param get
 * @param set
 * @param action.write - ファイル書き込みするDateTaskインスタンス
 * @param action.read - 戻り値として返す日付のDateTaskインスタンス (日付のみ設定した空のDateTaskを想定)
 * @returns action.readと同日のDateTaskを返す。(見つからなかった場合は引数の値をそのまま返す)
 */
export const useProcessDateTaskFile = () =>
  useAtomCallback(
    useCallback(async (get, _, action: DateTaskFileAction) => {
      const storagePath = get(storagePathAtom);

      // 日別タスクをファイル書き込み
      let updatedDateTasks: DateTask[] | undefined;
      if (action.write) {
        updatedDateTasks = await writeDateTask(action.write.getLogFileName(storagePath), action.write);
      }

      /** 対象月の日別タスクリスト (書き込みと同月の場合はファイル読み込みを省略) */
      const dateTasks =
        updatedDateTasks && action.read.getLogFileName() === action.write?.getLogFileName()
          ? updatedDateTasks
          : await readDateTasks(action.read.getLogFileName(storagePath));

      return dateTasks?.find((data) => data.date === action.read.date) ?? action.read;
    }, [])
  );

/**
 * 編集中日別タスクの最後のタスクを現在時刻まで延長する
 * @param get
 * @param dateTask
 * @returns 出力用文字列
 */
export const useFillDateTask = () =>
  useAtomCallback(
    useCallback(async (get, set) => {
      const dateTask = get(dateTaskAtom);
      const minuteStep = get(minuteStepAtom);

      const newTasks = [...dateTask.tasks];
      const [currentTask] = newTasks.splice(-1, 1);
      if (!currentTask) return;

      const now = new Time(floorNumberUnit(new Time().valueOf(), minuteStep));
      if (currentTask.endAt >= now) return;

      set(
        dateTaskAtom,
        new DateTask({
          date: dateTask.date,
          tasks: [...newTasks, new Task({ ...currentTask, endAt: now })],
        })
      );
    }, [])
  );

/**
 * 設定値を反映して出力用文字列を取得
 * @param get
 * @param dateTask
 * @returns 出力用文字列
 */
export const useGenerateDateTaskOutput = () =>
  useAtomCallback(
    useCallback(async (get, _, dateTask: DateTask) => {
      const projects = await get(projectsAtom);
      const taskSeparator = get(taskSeparatorAtom);
      const minuteStep = get(minuteStepAtom);
      const outputTemplate = get(outputTemplateAtom);

      const totalData = dateTask.totalize(projects, { taskSeparator, minuteStep });
      return replaceMustache(outputTemplate, totalData);
    }, [])
  );
