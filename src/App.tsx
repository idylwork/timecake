import { DndContext } from '@dnd-kit/core';
import { Cross2Icon, MinusIcon } from '@radix-ui/react-icons';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import classNames from 'classnames';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import './App.module.css';
import styles from './App.module.css';
import { ScreenMode, screenModeAtom } from './atoms/dateTaskState';
import PreferenceScreen from './components/PreferenceScreen';
import ProjectSettingScreen from './components/ProjectSettingScreen';
import TaskEditorScreen from './components/TaskEditorScreen';

const useWindowFocused = () => {
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    const unlisten = appWindow.onFocusChanged(({ payload: focused }) => {
      setIsFocused(focused);
    });
    return () => {
      (async () => {
        (await unlisten)();
      })();
    };
  }, []);

  return isFocused;
};

export default function App() {
  /** 画面表示モード */
  const screenMode = useAtomValue(screenModeAtom);
  /** アプリウィンドウがフォーカスされているか */
  const isWindowFocused = useWindowFocused();


  return (
    <DndContext>
      <div className={classNames(styles.controls, isWindowFocused && styles.isWindowFocused)}>
        <button type="button" className={classNames(styles.controlButton, styles.close)} onClick={() => appWindow.close()}>
          <Cross2Icon className={styles.controlIcon} />
        </button>
        <button type="button" className={classNames(styles.controlButton, styles.minimize)} onClick={() => appWindow.minimize()}>
          <MinusIcon className={styles.controlIcon} />
        </button>
      </div>
      {screenMode === ScreenMode.taskEditor && <TaskEditorScreen />}
      {screenMode === ScreenMode.projectSetting && <ProjectSettingScreen />}
      {screenMode === ScreenMode.preference && <PreferenceScreen />}
    </DndContext>
  );
}
