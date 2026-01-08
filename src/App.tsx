import { DndContext } from '@dnd-kit/core';
import { Cross2Icon, MinusIcon } from '@radix-ui/react-icons';
import { appWindow } from '@tauri-apps/api/window';
import classNames from 'classnames';
import { useAtomValue } from 'jotai';
import { Suspense, useEffect, useState } from 'react';
import './App.module.css';
import styles from './App.module.css';
import { useInitializeAtoms } from './atoms/initializeAtom';
import { ScreenMode, screenModeAtom } from './atoms/screenModeAtom';
import PreferenceScreen from './features/PreferenceScreen';
import ProjectSettingScreen from './features/ProjectSettingScreen';
import SplashScreen from './features/SplashScreen';
import TaskCalendarScreen from './features/TaskCalendarScreen';
import TaskDayScreen from './features/TaskDayScreen';
import useWindowFocused from './hooks/useWindowFocused';

export default function App() {
  /** 画面表示モード */
  const screenMode = useAtomValue(screenModeAtom);
  /** アプリウィンドウがフォーカスされているか */
  const isWindowFocused = useWindowFocused();
  /** 日別タスクのファイル操作 */
  const initializeProjectsAtom = useInitializeAtoms();
  /** Atomの初期化が完了したか */
  const [isInitialized, setIsInitialized] = useState(false);

  // アプリ起動時に日別タスクと関連情報を読み込み
  useEffect(() => {
    (async () => {
      await initializeProjectsAtom();
      setIsInitialized(true);
    })();
  }, []);

  if (!isInitialized) return <SplashScreen />;

  return (
    <div className={classNames(styles.root, isWindowFocused && styles.isWindowFocused)}>
      <Suspense fallback={<SplashScreen />}>
        <DndContext>
          <div className={styles.controls}>
            <button type="button" className={classNames(styles.controlButton, styles.close)} onClick={() => appWindow.close()}>
              <Cross2Icon className={styles.controlIcon} />
            </button>
            <button type="button" className={classNames(styles.controlButton, styles.minimize)} onClick={() => appWindow.minimize()}>
              <MinusIcon className={styles.controlIcon} />
            </button>
          </div>
          {screenMode === ScreenMode.taskEditor && <TaskDayScreen />}
          {screenMode === ScreenMode.taskMonth && <TaskCalendarScreen />}
          {screenMode === ScreenMode.taskYear && <TaskCalendarScreen />}
          {screenMode === ScreenMode.projectSetting && <ProjectSettingScreen />}
          {screenMode === ScreenMode.preference && <PreferenceScreen />}
        </DndContext>
      </Suspense>
    </div>
  );
}
