import { atom } from 'jotai';
import { Getter, Setter } from 'jotai/experimental';
import { atomWithStorage, useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import DateTask, { DateTaskData } from '../models/DateTask';
import MonthTotal from '../models/MonthTotal';
import Task from '../models/Task';
import Time from '../models/Time';
import { readJSONFile, writeJSONFile } from '../utils/file';
import { floorNumberUnit } from '../utils/number';
import { parseJSON, replaceMustache } from '../utils/string';
import { minuteStepAtom, monthlyOutputTemplateAtom, outputTemplateAtom, storagePathAtom, taskSeparatorAtom } from './preferenceAtom';
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
    set(dateTaskStorageAtom, update);
  }
);

/**
 * 日別タスク読み込みステータスAtom
 */
export const isDateTaskLoadingAtom = atom(true);

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
type DateTaskFileAction =
  | {
      write?: DateTask;
      read: DateTask | Date;
    }
  | {
      write: DateTask;
      read?: DateTask | Date;
    };

/**
 * 日別タスクファイルの読み込みと書き込みを行う
 * 対象ファイル名はDateTimeインスタンスの日付から自動的に判別する
 * action.read か action.write どちらかは必須
 * @param get
 * @param set
 * @param action.write - ファイル書き込みするDateTaskインスタンス
 * @param action.read - 戻り値として返す日付のDateTaskインスタンス (日付のみの指定も可能)
 * @returns action.readと同日のDateTaskを返す。(見つからなかった場合は引数の値をそのまま返す)
 */
export const useProcessDateTaskFile = () =>
  useAtomCallback(
    useCallback(async (get, _, action: DateTaskFileAction): Promise<DateTask> => {
      const storagePath = get(storagePathAtom);

      // action.write が指定されている場合は日別タスクをファイル書き込み
      let updatedDateTasks: DateTask[] | undefined;
      if (action.write) {
        updatedDateTasks = await writeDateTask(action.write.getLogFileName(storagePath), action.write);
      }

      // action.read が指定されている場合は日別タスクをファイル読み込み (action.writeと同月の場合はファイル読み込みを省略)
      if (action.read) {
        const read = action.read instanceof DateTask ? action.read : new DateTask({ date: action.read });
        const dateTasks =
          updatedDateTasks && read.getLogFileName() === action.write?.getLogFileName()
            ? updatedDateTasks
            : await readDateTasks(read.getLogFileName(storagePath));
        return dateTasks?.find((data) => data.date === read.date) ?? read;
      }
      return action.write!;
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
 * @returns 出力用文字列
 */
export const useGenerateDateTaskOutput = () =>
  useAtomCallback(
    useCallback(async (get) => {
      const dateTask = get(dateTaskAtom);
      const projects = await get(projectsAtom);
      const taskSeparator = get(taskSeparatorAtom);
      const outputTemplate = get(outputTemplateAtom);

      const totalData = dateTask.totalize({ projects, taskSeparator });
      return replaceMustache(outputTemplate, totalData);
    }, [])
  );

/**
 * 設定値を反映して月別タスクの出力用文字列を取得
 * @param date - 年月を取得するためのDateオブジェクト
 * @returns 出力用文字列
 */
export const useGenerateMonthTaskOutput = () =>
  useAtomCallback(
    useCallback(async (get, _, date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const projects = get(projectsAtom);
      const taskSeparator = get(taskSeparatorAtom);
      const outputTemplate = get(monthlyOutputTemplateAtom);
      const storagePath = get(storagePathAtom);

      // 月のデータを取得
      const targetDateTask = new DateTask({ date: new Date(year, month - 1) });
      const dateTasksData = await readJSONFile(`${storagePath}/${targetDateTask.getLogFileName()}`);
      const dateTasks: DateTask[] = dateTasksData instanceof Array ? dateTasksData.map((datum) => new DateTask(datum)) : [];

      // MonthTotalを作成して集計データを取得
      const monthTotal = new MonthTotal({ year, month, dateTasks });

      // 月内全ての日付のプロジェクトデータをフラットなリストに展開
      const projectsList = dateTasks.flatMap((dateTask) => {
        const totalData = dateTask.totalize({ projects, taskSeparator });
        return totalData.projects.map((project) => ({
          ...project,
          date: totalData.date,
          weekday: totalData.weekday,
        }));
      });

      // 月全体の合計時間（時間単位）
      const totalHours = monthTotal.total / 60;

      const totalData = {
        year: monthTotal.year,
        month: monthTotal.month,
        projects: projectsList,
        total: totalHours,
      };

      return replaceMustache(outputTemplate, totalData);
    }, [])
  );

/**
 * 1月分の日別統計データリストを取得する
 * @param props.year - 年
 * @param props.month - 月
 * @returns
 */
export const useFetchMonthTasks = () =>
  useAtomCallback(
    useCallback(async (get: Getter, _: Setter, year: number, month: number) => {
      const storagePath = get(storagePathAtom);

      const targetDateTask = new DateTask({ date: new Date(year, month - 1) });
      const data = await readJSONFile(`${storagePath}/${targetDateTask.getLogFileName()}`);
      if (!(data instanceof Array)) return new MonthTotal({ year, month, dateTasks: [] });

      return new MonthTotal({ year, month, dateTasks: data.map((datum) => new DateTask(datum)) });
    }, [])
  );
