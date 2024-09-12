import { useAtom, useAtomValue } from 'jotai';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { dateTaskAtom } from '../../atoms/dateTaskAtom';
import { minuteStepAtom } from '../../atoms/preferenceAtom';
import { projectsAtom } from '../../atoms/projectsAtom';
import { PIXEL_PER_MINUTE } from '../../constants';
import DateTask from '../../models/DateTask';
import Task from '../../models/Task';
import Time from '../../models/Time';
import { dateToString } from '../../utils/Date';
import { floorNumberUnit } from '../../utils/number';
import { TaskBlock } from '../TaskBlock';
import TaskBlockListBackground from './background';
import styles from './index.module.css';

/**
 * 1日分のタスク設定リスト
 * @param props.dateTask - 表示する日別のタスクグループ
 * @param props.setDateTask - 日別のタスクグループの更新
 * @returns
 */
export default function TaskBlockList() {
  /** 日別タスクグループ */
  const [dateTask, setDateTask] = useAtom(dateTaskAtom);
  /** プロジェクトリスト */
  const projects = useAtomValue(projectsAtom);
  /** タスク時間単位 */
  const minuteStep = useAtomValue(minuteStepAtom);
  /** コンポーネントルート要素の参照 */
  const rootRef = useRef<HTMLDivElement>(null);
  /** 今日のタスクグループか */
  const isToday = useMemo(() => dateTask.date === dateToString(new Date()), [dateTask.date]);

  /**
   * 日別タスクグループを更新
   * @param index
   * @param task
   */
  const updateDateTask = (index: number, task: Task | null) => {
    const tasks = task
      ? dateTask.tasks
          .map((old, targetIndex) => {
            // 指定のインデックスのみ更新する
            if (targetIndex !== index) {
              return old;
            }

            // 移動操作をしたときは空きのある範囲であることを確認する
            if (task.startAt !== old.startAt) {
              if (!dateTask.validateTask(task, targetIndex)) {
                return old;
              }
            } else {
              // 時間範囲変更をしたときは拡張可能な範囲に収める
              if (task.endAt !== old.endAt) {
                const next = dateTask.tasks[targetIndex + 1];
                if (next && next.startAt < task.endAt) {
                  task.endAt = next.startAt;
                } else if (Time.MAX < task.endAt) {
                  task.endAt = Time.MAX;
                }
              }
            }

            return task;
          })
          .sort((a, b) => a.startAt.valueOf() - b.startAt.valueOf())
      : dateTask.tasks.filter((_, targetIndex) => targetIndex !== index);
    const newDateTask = new DateTask({ ...dateTask, tasks });
    setDateTask(newDateTask);
  };

  /**
   * クリック位置に応じてタスクを新規追加する
   * @param event
   */
  const appendTask = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const layerY = event.pageY - rect.y - (rootRef.current ? rootRef.current.scrollTop - rootRef.current.scrollTop : 0);
    const startAt = new Time(floorNumberUnit(layerY / PIXEL_PER_MINUTE, minuteStep));
    const newTask = new Task({
      projectId: projects instanceof Array ? projects[0]?.id : undefined,
      body: '',
      startAt: startAt,
      endAt: startAt.toAdded(Math.max(minuteStep, 60)),
    });

    // 下にタスクがある場合は時間範囲を狭めて追加できないか試行
    if (!dateTask.validateTask(newTask)) {
      newTask.endAt = startAt.toAdded(Math.max(minuteStep, 30));
      if (!dateTask.validateTask(newTask)) return;
    }

    const tasks = [...dateTask.tasks, newTask].sort((a, b) => a.startAt.valueOf() - b.startAt.valueOf());
    setDateTask(new DateTask({ ...dateTask, tasks }));
  };

  useLayoutEffect(() => {
    // 現在時刻周辺か最初のタスクまで自動スクロールする
    if (!rootRef.current) return;

    const top = isToday ? (new Time().valueOf() - 120) * PIXEL_PER_MINUTE : (dateTask.tasks[0]?.startAt.valueOf() ?? 600) * PIXEL_PER_MINUTE;
    rootRef.current.scrollTo({ top });
  }, [dateTask.date]);

  return (
    <section ref={rootRef} className={styles.root}>
      <div className={styles.container}>
        <div className={styles.foreground}>
          {dateTask.tasks.map((task, index) => (
            <TaskBlock key={`${dateTask.date}-${task.startAt}`} task={task} onChange={(newTask) => updateDateTask(index, newTask)} />
          ))}
        </div>
        <TaskBlockListBackground date={dateTask.date} onClick={appendTask} />
      </div>
    </section>
  );
}
