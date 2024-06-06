import { CheckIcon } from '@radix-ui/react-icons';
import { useSetAtom } from 'jotai';
import { ScreenMode, screenModeAtom } from '../../atoms/dateTaskState';
import Button from '../Button';
import NavigationTab from '../NavigationTab';
import ProjectList from '../ProjectList';
import ScreenLayout, { ScreenActions } from '../ScreenLayout';
import styles from './index.module.css';

/**
 * プロジェクト設定画面
 * @returns
 */
export default function ProjectSettingScreen() {
  /** 画面表示モード */
  const setScreenMode = useSetAtom(screenModeAtom);

  return (
    <ScreenLayout title="プロジェクト設定">
      <NavigationTab
        items={{
          一般: ScreenMode.preference,
          プロジェクト: ScreenMode.projectSetting,
        }}
        selection={ScreenMode.projectSetting}
        onChange={(screenMode) => setScreenMode(screenMode)}
      />
      <ProjectList />
      <ScreenActions>
        <Button size="large" className={styles.ok} icon={<CheckIcon />} onClick={() => setScreenMode(ScreenMode.taskEditor)}>
          OK
        </Button>
      </ScreenActions>
    </ScreenLayout>
  );
}
