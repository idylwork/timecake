import { useEffect, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import classNames from 'classnames';
import styles from './index.module.css';
import Task from '../../models/Task';
import { minuteStepAtom, projectsAtom, taskSeparatorAtom } from '../../atoms/dateTaskState';
import { floorNumberUnit } from '../../utils/number';
import Project from '../../models/Project';
import VerticalDraggableArea from '../VerticalDraggableArea';
import ProjectSelectorPopover from '../ProjectSelectorPopover';
import { PIXEL_PER_MINUTE } from '../../constants';
import { TrashIcon } from '@radix-ui/react-icons';

interface Props {
  task: Task;
  onChange: (newValue: Task | null) => void;
}

/**
 * 1つのタスク時間帯を表現するブロック
 * @param props.task - タスク
 * @param props.onChange - データ変更時
 * @returns
 */
export const TaskBlock = ({ task, onChange }: Props) => {
  /** プロジェクトリスト */
  const projects = useAtomValue(projectsAtom);
  /** タスク内容 */
  const [body, setBody] = useState('');
  /** 編集可能か */
  const [isEditable, setIsEditable] = useState(task.body === '');
  /** 対応時間(分) */
  const minutes = useMemo(() => task.minutes, [task.startAt, task.endAt])
  /** ドラッグで移動するタスク期間(分) */
  const [movingMinutes, setMovingMinutes] = useState(0);
  /** ドラッグで増加するタスク期間(分) */
  const [resizingMinutes, setResizingMinutes] = useState(0);
  /** タスクの所属するプロジェクト */
  const project = useMemo(() => task.projectFrom(projects), [task.projectId, projects])
  /** プロジェクトを選択中か */
  const [isProjectEditing, setIsProjectEditing] = useState(false);
  /** 内容入力フォームの参照 */
  const inputRef = useRef<HTMLInputElement>(null);
  /** 表示領域が小さいか */
  const isSmallSize = useMemo(() => task.minutes + resizingMinutes < 60, [task.startAt, task.endAt, resizingMinutes]);
  /** タスク区切り文字 */
  const taskSeparator = useAtomValue(taskSeparatorAtom);
  /** タスク時間単位 */
  const minuteStep = useAtomValue(minuteStepAtom);

  /**
   * 編集開始
   */
  const startEdit = () => {
    setBody(task.body);
    setIsEditable(true);
  };

  /**
   * 編集終了
   */
  const endEdit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsEditable(false);
    onChange(new Task({ ...task, body }));
  }

  /**
   * プロジェクト選択を変更
   * @param project - 選択されたプロジェクト (なにも選択されなかった場合はnull)
   */
  const handleProjectChange = (project: Project | null) => {
    setIsProjectEditing(false);
    if (!project) return;
    onChange(new Task({ ...task, projectId: project.id }));
  }

  /**
   * 内容入力時の処理
   * @param event
   */
  const handleBodyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBody(event.currentTarget.value);
  };

  /**
   * 移動中の処理
   * @param y
   */
  const handleMove = (y: number) => {
    const startAt = task.startAt.valueOf();
    setMovingMinutes(floorNumberUnit(startAt + (-y / PIXEL_PER_MINUTE), minuteStep) - startAt);
  };

  /**
   * 移動終了時の処理
   */
  const handleMoveEnd = () => {
    let fixedMovingMinutes = 0;
    setMovingMinutes((movingMinutes) => {
      fixedMovingMinutes = movingMinutes;
      return 0;
    });
    onChange(new Task({ ...task, startAt: task.startAt.toAdded(fixedMovingMinutes), endAt: task.endAt.toAdded(fixedMovingMinutes) }));
  };

  /**
   * リサイズ中の処理
   * @param y
   */
  const handleResize = (y: number) => {
    const newDraggingMinutes = floorNumberUnit(-y, minuteStep);
    if (-newDraggingMinutes < minutes) {
      setResizingMinutes(newDraggingMinutes);
    }
  };

  /**
   * リサイズ終了
   */
  const handleResizeEnd = () => {
    let fixedResizingMinutes = 0;
    setResizingMinutes((resizingMinutes) => {
      fixedResizingMinutes = resizingMinutes;
      return 0;
    });
    onChange(new Task({ ...task, endAt: task.endAt.toAdded(fixedResizingMinutes) }));
  };

  useEffect(() => {
    if (!isEditable || !inputRef.current) return;
    inputRef.current.focus()
  }, [isEditable]);

  return (
    <div
      className={styles.root}
      style={{
        height: `${(minutes + resizingMinutes) * PIXEL_PER_MINUTE}px`,
        top: `${(task.startAt.valueOf() + movingMinutes) * PIXEL_PER_MINUTE}px`,
        zIndex: isProjectEditing || movingMinutes !== 0 ? 3 : undefined,
        opacity: movingMinutes !== 0 ? 0.9 : undefined,
      }}
    >
      <VerticalDraggableArea onDragging={handleMove} onDragEnd={handleMoveEnd} className={classNames(styles.block, (project?.color.isDark ?? false) && styles.isDark, isSmallSize && styles.isSmall)} style={{ backgroundColor: project?.color.toString() ?? '#dddddd' }}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.row}>
              <time className={styles.time}>
                {`${task.startAt} - ${task.endAt.toAdded(resizingMinutes)}`} ({`${(minutes + resizingMinutes) / 60}`}h)
              </time>
              <ProjectSelectorPopover open={isProjectEditing} onChange={handleProjectChange} />
              <button type="button" className={styles.project} onClick={() => setIsProjectEditing(true)}>{project?.name ?? '-'}</button>
            </div>
            {isEditable ? (
              <form className={styles.form} onSubmit={endEdit}>
                <input ref={inputRef} type="text" className={styles.body} value={body} onChange={handleBodyChange} onBlur={endEdit} />
                <button type="button" className={styles.button} onMouseDown={() => onChange(null)}>
                  <TrashIcon />
                </button>
              </form>
            ) : (
              <div className={styles.body} onClick={startEdit}>{task.body.split(taskSeparator).map((bodyItem, index) => (
                <span key={index}>
                  {index > 0 && <span className={styles.separator}>{taskSeparator}</span>}
                  {bodyItem}
                </span>
              ))}</div>
            )}
          </div>
          <VerticalDraggableArea className={styles.resizeHandle} onDragging={handleResize} onDragEnd={handleResizeEnd} />
        </div>
      </VerticalDraggableArea>
    </div>
  );
};
