import { useSetAtom } from 'jotai';
import { CheckIcon } from '@radix-ui/react-icons';
import ProjectList from '../ProjectList';
import { ScreenMode, displayModeAtom } from '../../atoms/dateTaskState';
import styles from './index.module.css';
import Button from '../Button';
import ScreenLayout, { ScreenActions } from '../ScreenLayout';

/**
 * プロジェクト設定画面
 * @returns 
 */
export default function ProjectSettingScreen() {
  /** 画面表示モード */
  const setDisplayingMode = useSetAtom(displayModeAtom);

  return (
    <ScreenLayout title="プロジェクト設定">
      <ProjectList />
      <ScreenActions>
        <Button size="large" className={styles.ok} icon={<CheckIcon />} onClick={() => setDisplayingMode(ScreenMode.taskEditor)}>OK</Button>
      </ScreenActions>
    </ScreenLayout>
  );
};
