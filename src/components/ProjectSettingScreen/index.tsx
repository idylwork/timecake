import { useSetAtom } from 'jotai';
import { CheckIcon } from '@radix-ui/react-icons';
import ProjectList from '../ProjectList';
import { ScreenMode, screenModeAtom } from '../../atoms/dateTaskState';
import styles from './index.module.css';
import Button from '../Button';
import ScreenLayout, { ScreenActions } from '../ScreenLayout';
import NavigationTab from '../NavigationTab';

/**
 * プロジェクト設定画面
 * @returns
 */
export default function ProjectSettingScreen() {
  /** 画面表示モード */
  const setScreenMode = useSetAtom(screenModeAtom);

  return (
    <ScreenLayout title="プロジェクト設定">
      <NavigationTab items={{'一般': ScreenMode.preference, 'プロジェクト': ScreenMode.projectSetting }} selection={ScreenMode.projectSetting} onChange={(screenMode) => setScreenMode(screenMode)} />
      <ProjectList />
      <ScreenActions>
        <Button size="large" className={styles.ok} icon={<CheckIcon />} onClick={() => setScreenMode(ScreenMode.taskEditor)}>OK</Button>
      </ScreenActions>
    </ScreenLayout>
  );
};
