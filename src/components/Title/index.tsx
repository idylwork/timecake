import { GearIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import { useSetAtom } from 'jotai';
import { ScreenMode, screenModeAtom } from '../../atoms/screenModeAtom';
import styles from './index.module.css';

interface Props extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * アプリケーションのタイトル部分
 * @param props.children - タイトルに表示する内容
 * @returns
 */
export default function Title({ className, children }: Props) {
  /** 画面表示モード */
  const setScreenMode = useSetAtom(screenModeAtom);

  /**
   * 設定画面に切り替える
   */
  const toggleSettingScreen = () => {
    setScreenMode((displayMode) => (displayMode === ScreenMode.taskEditor ? ScreenMode.preference : ScreenMode.taskEditor));
  };

  return (
    <div className={classNames(styles.root, className)} data-tauri-drag-region="default">
      {children}
      <button type="button" className={styles.setting} onClick={toggleSettingScreen}>
        <GearIcon />
      </button>
    </div>
  );
}
