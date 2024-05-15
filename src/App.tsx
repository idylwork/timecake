// import { useState } from 'react';
import { useAtomValue } from 'jotai';
// import { invoke } from '@tauri-apps/api/tauri';
import './App.module.css';
import { DndContext } from '@dnd-kit/core';
import { ScreenMode, displayModeAtom } from './atoms/dateTaskState';
import ProjectSettingScreen from './components/ProjectSettingScreen';
import TaskEditorScreen from './components/TaskEditorScreen';
import PreferenceScreen from './components/PreferenceScreen';

export default function App() {
  /** 表示モード */
  const displayMode = useAtomValue(displayModeAtom);
  
  // const [greetMsg, setGreetMsg] = useState('');
  // async function greet() {
  //   setGreetMsg(await invoke('greet', { name: 'NAMETEST' }));
  // }

  return (
    <DndContext>
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
