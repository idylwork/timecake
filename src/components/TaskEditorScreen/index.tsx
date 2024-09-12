import classNames from 'classnames';
import { useAtomValue } from 'jotai';
import { dateTaskAtom, isDateTaskChangedAtom } from '../../atoms/dateTaskAtom';
import ActionMenu from '../ActionMenu';
import ScreenLayout from '../ScreenLayout';
import TaskBlockList from '../TaskBlockList';
import styles from './index.module.css';

/**
 * タスク編集画面
 * @returns
 */
export default function TaskEditorScreen() {
  /** 編集中日別タスク */
  const dateTask = useAtomValue(dateTaskAtom);
  /** 編集中日別タスクが変更されたか */
  const isDateTaskChanged = useAtomValue(isDateTaskChangedAtom);

  return (
    <ScreenLayout
      title={`${dateTask.getMonth()}/${dateTask.getDate()} (${dateTask.getWeekday()})`}
      titleClassName={classNames(styles.title, isDateTaskChanged ? styles.isChanged : '')}
      padding={false}
    >
      <div className={styles.header}>
        <ActionMenu />
      </div>
      <TaskBlockList />
      <time className={styles.time}>{dateTask.hours}h</time>
    </ScreenLayout>
  );
}
