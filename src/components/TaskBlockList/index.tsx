import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { dateTaskAtom, minuteStepAtom, projectsAtom } from '../../atoms/dateTaskState';
import { PIXEL_PER_MINUTE } from '../../constants';
import DateTask from '../../models/DateTask';
import Task from '../../models/Task';
import Time from '../../models/Time';
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
    const layerY = event.nativeEvent.layerY - (rootRef.current ? rootRef.current.scrollTop - rootRef.current.scrollTop : 0);
    const startAt = new Time(floorNumberUnit(layerY / PIXEL_PER_MINUTE, minuteStep));
    const newTask = new Task({
      projectId: projects[0].id,
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

  useEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.scrollTo({
      top: (new Time().valueOf() - 120) * PIXEL_PER_MINUTE,
    });
  }, [rootRef.current]);

  return (
    <section ref={rootRef} className={styles.root}>
      <div className={styles.container}>
        <div className={styles.foreground}>
          {dateTask.tasks.map((task, index) => (
            <TaskBlock key={task.startAt.toString()} task={task} onChange={(newTask) => updateDateTask(index, newTask)} />
          ))}
        </div>
        <TaskBlockListBackground onClick={appendTask} />
      </div>
    </section>
  );
}
