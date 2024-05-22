// import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { appWindow } from '@tauri-apps/api/window';
// import { invoke } from '@tauri-apps/api/tauri';
import './App.module.css';
import { DndContext } from '@dnd-kit/core';
import { ScreenMode, displayModeAtom } from './atoms/dateTaskState';
import ProjectSettingScreen from './components/ProjectSettingScreen';
import TaskEditorScreen from './components/TaskEditorScreen';
import PreferenceScreen from './components/PreferenceScreen';
import styles from './App.module.css'
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Cross2Icon, MinusIcon } from '@radix-ui/react-icons';

const useWindowFocused = () => {
  const [isFocused, setIsFocused] = useState(true)

  useEffect(() => {
    const unlisten = appWindow.onFocusChanged(({ payload: focused }) => {
      setIsFocused(focused)
    });
    return () => {
      (async () => {
        (await unlisten)()
      })()
    };
  }, [])

  return isFocused
}

export default function App() {
  /** 表示モード */
  const displayMode = useAtomValue(displayModeAtom);

  // const [greetMsg, setGreetMsg] = useState('');
  // async function greet() {
  //   setGreetMsg(await invoke('greet', { name: 'NAMETEST' }));
  // }

  const isWindowFocused = useWindowFocused()

  return (
    <DndContext>
      <div className={classNames(styles.controls, isWindowFocused && styles.isWindowFocused)}>
        <button className={classNames(styles.controlButton, styles.close)} onClick={() => appWindow.close()}>
          <Cross2Icon className={styles.controlIcon} />
        </button>
        <button className={classNames(styles.controlButton, styles.minimize)} onClick={() => appWindow.minimize()}>
          <MinusIcon className={styles.controlIcon} />
        </button>
      </div>
      {displayMode === ScreenMode.taskEditor && (
        <TaskEditorScreen />
      )}
      {displayMode === ScreenMode.projectSetting && (
        <ProjectSettingScreen />
      )}
      {displayMode === ScreenMode.preference && (
        <PreferenceScreen />
      )}
    </DndContext>
  );
}
