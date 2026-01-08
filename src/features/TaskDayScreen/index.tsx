import classNames from 'classnames';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { dateTaskAtom, isDateTaskChangedAtom, isDateTaskLoadingAtom } from '../../atoms/dateTaskAtom';
import { useChangeDateTask } from '../../atoms/initializeAtom';
import ActionMenu from '../../components/ActionMenu';
import ScreenLayout from '../../components/ScreenLayout';
import TimelineView from '../../components/TimelineView';
import useWindowFocused from '../../hooks/useWindowFocused';
import styles from './index.module.css';

/**
 * タスク編集画面
 * @returns
 */
export default function TaskDayScreen() {
  /** 編集中日別タスク */
  const dateTask = useAtomValue(dateTaskAtom);
  /** 編集中日別タスクが変更されたか */
  const isDateTaskChanged = useAtomValue(isDateTaskChangedAtom);
  /** 日別タスクの読み込み中か */
  const isDateTaskLoading = useAtomValue(isDateTaskLoadingAtom);
  /** 編集する日付を変更 */
  const changeDateTask = useChangeDateTask();
  /** アプリウィンドウがフォーカスされているか */
  const isWindowFocused = useWindowFocused();
  /** 日別タスクに変更がある場合はファイル保存する */
  const saveDateTask = () => {
    if (isDateTaskChanged) {
      changeDateTask(undefined, dateTask);
    }
  };

  // 画面を離れるときに日別タスクに変更があったら保存する
  useEffect(() => saveDateTask, []);
  useEffect(() => {
    if (!isWindowFocused) saveDateTask();
  }, [isWindowFocused]);

  return (
    <ScreenLayout
      title={`${dateTask.getMonth()}/${dateTask.getDate()} (${dateTask.getWeekday()})`}
      titleClassName={classNames(styles.title, isDateTaskChanged ? styles.isChanged : '')}
      padding={false}
    >
      <div className={styles.header}>
        <ActionMenu />
      </div>

      <div className={styles.body}>
        <div className={classNames(styles.loading, isDateTaskLoading && styles.loadingActive)} />
        <TimelineView />
        <time className={styles.time}>{dateTask.hours}h</time>
      </div>
    </ScreenLayout>
  );
}
