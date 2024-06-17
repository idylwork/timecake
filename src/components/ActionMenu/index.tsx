import { ChevronLeftIcon, ChevronRightIcon, CopyIcon, Cross2Icon, PinBottomIcon } from '@radix-ui/react-icons';
import { useAtom, useAtomValue } from 'jotai';
import { dateTaskAtom, dateTaskLogsAtom, minuteStepAtom, outputTemplateAtom, projectsAtom, taskSeparatorAtom } from '../../atoms/dateTaskState';
import DateTask from '../../models/DateTask';
import Task from '../../models/Task';
import Time from '../../models/Time';
import { floorNumberUnit } from '../../utils/number';
import { replaceMustache } from '../../utils/string';
import Button, { ButtonGroup } from '../Button';
import styles from './index.module.css';

/**
 * タスクに関する操作ボタン
 * @returns
 */
export default function ActionMenu() {
  /** 日別タスクグループ */
  const [dateTask, setDateTask] = useAtom(dateTaskAtom);
  /** プロジェクトリスト */
  const projects = useAtomValue(projectsAtom);
  /** 出力用テンプレート */
  const outputTemplate = useAtomValue(outputTemplateAtom);
  /** タスク区切り文字 */
  const taskSeparator = useAtomValue(taskSeparatorAtom);
  /** タスク時間単位 */
  const minuteStep = useAtomValue(minuteStepAtom);
  const [dateTaskLogs, setDateTaskLogs] = useAtom(dateTaskLogsAtom);

  /**
   * 日付を移動する
   * @param diff - 移動する日数
   */
  const moveDate = (diff: number | undefined = undefined) => {
    // 現在の日別タスクをログに書き込み
    setDateTaskLogs(dateTask);

    // ログから日別タスクを読み込み
    const date = diff !== undefined ? new Date(dateTask.getYear(), dateTask.getMonth() - 1, dateTask.getDate() + diff) : new Date();
    let newDateTask = new DateTask({ date: date, tasks: [] });
    if (dateTask.date === newDateTask.date) return;
    newDateTask = dateTaskLogs.get(newDateTask.date) ?? newDateTask;
    setDateTask(newDateTask);
  };

  /**
   * タスクを全削除
   */
  const removeAllTasks = () => {
    setDateTask(new DateTask({ date: dateTask.date, tasks: [] }));
  };

  /**
   * 最後のタスクを現在時刻まで延長する
   */
  const fillCurrentTask = () => {
    const newTasks = [...dateTask.tasks];
    const [currentTask] = newTasks.splice(-1, 1);
    if (!currentTask) return;

    const now = new Time(floorNumberUnit(new Time().valueOf(), minuteStep));
    if (currentTask.endAt >= now) return;

    setDateTask(
      new DateTask({
        date: dateTask.date,
        tasks: [...newTasks, new Task({ ...currentTask, endAt: now })],
      })
    );
  };

  /**
   * クリップボードにコピー
   */
  const copyToClipboard = () => {
    const total = dateTask.totalize(projects, {
      separator: taskSeparator,
      minuteStep: minuteStep,
    });
    const text = replaceMustache(outputTemplate, total);
    console.info(text);
    navigator.clipboard.writeText(text);
  };

  return (
    <section className={styles.root} data-tauri-drag-region="default">
      <ButtonGroup>
        <Button size="small" icon={<ChevronLeftIcon />} onClick={() => moveDate(-1)}></Button>
        <Button size="small" onClick={() => moveDate()}>
          今日
        </Button>
        <Button size="small" icon={<ChevronRightIcon />} onClick={() => moveDate(1)}></Button>
      </ButtonGroup>
      <Button size="small" icon={<Cross2Icon />} complete="Done!" onClick={removeAllTasks}>
        クリア
      </Button>
      <Button size="small" icon={<CopyIcon />} complete="Copied!" onClick={copyToClipboard}>
        コピー
      </Button>
      <Button size="small" icon={<PinBottomIcon />} complete="Filled!" onClick={fillCurrentTask}>
        延長
      </Button>
    </section>
  );
}
