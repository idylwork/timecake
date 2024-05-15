import { useAtom, useAtomValue } from 'jotai';
import { dateTaskAtom, outputTemplateAtom, projectsAtom } from '../../atoms/dateTaskState';
import DateTask from '../../models/DateTask';
import { replaceMustache } from '../../utils/string';
import styles from './index.module.css';
import { CopyIcon, Cross2Icon, PinBottomIcon } from '@radix-ui/react-icons';
import Button from '../Button';
import Time from '../../models/Time';
import Task from '../../models/Task';
import { floorNumberUnit } from '../../utils/number';
import { UNIT_MINUTES } from '../../constants';

export default function ActionMenu() {
  /** 日別タスクグループ */
  const [dateTask, setDateTask] = useAtom(dateTaskAtom);
  /** プロジェクトリスト */
  const projects = useAtomValue(projectsAtom);
  /** 出力用テンプレート */
  const outputTemplate = useAtomValue(outputTemplateAtom);

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

    const now = floorNumberUnit((new Time()).valueOf(), UNIT_MINUTES);
    if (currentTask.endAt.valueOf() >= now) return;

    setDateTask(new DateTask({ date: dateTask.date, tasks: [...newTasks, new Task({ ...currentTask, endAt: now })] }));
  }

  /**
   * 出力
   */
  const output = () => {
    const debugDateTask = new DateTask({ date: new Date(), tasks: dateTask.tasks });
    const total = debugDateTask.totalize(projects, { separator: '・' });
    const text = replaceMustache(outputTemplate, total);
    console.info(text);
    navigator.clipboard.writeText(text);
  };
  
  return (
    <section className={styles.root} data-tauri-drag-region="default">
      <Button size="small" icon={<Cross2Icon />} complete="Done!" onClick={removeAllTasks}>クリア</Button>
      <Button size="small" icon={<PinBottomIcon />} complete="Filled!" onClick={fillCurrentTask}>延長</Button>
      <Button size="small" icon={<CopyIcon />} complete="Copied!" onClick={output}>コピー</Button>
    </section>
  );
}
