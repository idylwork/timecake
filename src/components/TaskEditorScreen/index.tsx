import { useAtom } from 'jotai';
import { dateTaskAtom } from '../../atoms/dateTaskState';
import TaskBlockList from '../TaskBlockList';
import styles from './index.module.css';
import ActionMenu from '../ActionMenu';
import ScreenLayout from '../ScreenLayout';

/**
 * タスク編集画面
 * @returns 
 */
export default function TaskEditorScreen() {
  /** 日別タスクグループ */
  const [dateTask] = useAtom(dateTaskAtom);

  return (
    <ScreenLayout title={dateTask.date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })} padding={false}>              
      <div className={styles.header}>
        <ActionMenu />
      </div>
      <TaskBlockList />
      <time className={styles.time}>{dateTask.hours}h</time>
    </ScreenLayout>
  );
};
