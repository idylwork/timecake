import { GearIcon } from '@radix-ui/react-icons';
import styles from './index.module.css';
import { ScreenMode, screenModeAtom } from '../../atoms/dateTaskState';
import { useSetAtom } from 'jotai';

interface Props {
  children: React.ReactNode
}

/**
 * アプリケーションのタイトル部分
 * @param props.children - タイトルに表示する内容
 * @returns
 */
export default function Title({ children }: Props) {
  /** 画面表示モード */
  const setScreenMode = useSetAtom(screenModeAtom);

  /**
   * 設定画面に切り替える
   */
  const toggleSettingScreen = () => {
    setScreenMode((displayMode) => displayMode === ScreenMode.taskEditor ? ScreenMode.preference : ScreenMode.taskEditor);
  };

  return (
    <div className={styles.root} data-tauri-drag-region="default">
      {children}
      <button type="button" className={styles.setting} onClick={toggleSettingScreen}>
        <GearIcon />
      </button>
    </div>
  );
}
