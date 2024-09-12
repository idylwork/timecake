import { ChevronLeftIcon, ChevronRightIcon, CopyIcon, Cross2Icon, PinBottomIcon } from '@radix-ui/react-icons';
import { useAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { dateTaskAtom, useFillDateTask, useGenerateDateTaskOutput } from '../../atoms/dateTaskAtom';
import { useChangeDateTask } from '../../atoms/initializeAtom';
import DateTask from '../../models/DateTask';
import { dateToString, dateWithoutTime } from '../../utils/Date';
import Button, { ButtonGroup } from '../Button';
import styles from './index.module.css';

/**
 * タスクに関する操作ボタン
 * @returns
 */
export default function ActionMenu() {
  /** 編集中日別タスクグループ */
  const [dateTask, setDateTask] = useAtom(dateTaskAtom);
  /** 日付の移動中か */
  const [isMovingDate, setIsMovingDate] = useState(false);
  /** 最後のタスクを現在時刻まで延長 */
  const fillDateTask = useFillDateTask();
  /** 日別タスクの出力用文字列取得 */
  const createDateTaskOutput = useGenerateDateTaskOutput();
  /** 編集する日付を変更 */
  const changeDateTask = useChangeDateTask();
  /** 編集中の日別タスクが本日日付か */
  const isToday = useMemo(() => dateTask.date === dateToString(new Date()), [dateTask.date]);

  /**
   * 日付を移動してファイルの読み書き
   * @param diff - 移動する日数 (未指定で本日)
   */
  const changeDate = async (diff: number | undefined = undefined) => {
    if (isMovingDate) return;
    setIsMovingDate(true);

    // 編集中日付のタスクをファイル保存して対象日付を新しく読み込み
    const today = dateWithoutTime();
    const newDate = diff !== undefined ? new Date(dateTask.getYear(), dateTask.getMonth() - 1, dateTask.getDate() + diff) : today;
    await changeDateTask(newDate, dateTask);
    setIsMovingDate(false);
  };

  /**
   * タスクを全削除
   */
  const removeAllTasks = () => {
    setDateTask(new DateTask({ date: dateTask.date, tasks: [] }));
  };

  /**
   * 出力用文字列を作成してクリップボードにコピー
   */
  const copyToClipboard = async () => {
    const text = await createDateTaskOutput(dateTask);
    navigator.clipboard.writeText(text);
  };

  return (
    <section className={styles.root} data-tauri-drag-region="default">
      <ButtonGroup>
        <Button size="small" icon={<ChevronLeftIcon />} onClick={() => changeDate(-1)}></Button>
        <Button size="small" complete="Jump!" onClick={() => changeDate()}>
          今日
        </Button>
        <Button size="small" icon={<ChevronRightIcon />} onClick={() => changeDate(1)}></Button>
      </ButtonGroup>
      <Button size="small" icon={<Cross2Icon />} complete="Done!" onClick={removeAllTasks}>
        クリア
      </Button>
      <Button size="small" icon={<CopyIcon />} complete="Copied!" onClick={copyToClipboard}>
        コピー
      </Button>
      <Button size="small" icon={<PinBottomIcon />} complete="Filled!" onClick={fillDateTask} disabled={!isToday}>
        延長
      </Button>
    </section>
  );
}
