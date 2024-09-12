import { open } from '@tauri-apps/api/dialog';
import { appDataDir } from '@tauri-apps/api/path';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './index.module.css';

interface HTMLGeneralProps {
  className?: string;
  value: string;
}

interface Props extends HTMLGeneralProps {
  onChange: (newValue: string) => void;
}

/**
 * Tauriのファイル選択ダイアログを利用してローカルパスを入力する
 * @param props.children -
 * @return
 */
export default function PathInput({ className, value, onChange, ...props }: Props) {
  /** パス選択中か */
  const [inProgress, setInProgress] = useState(false);

  /**
   * クリック時の動作
   */
  const handleClick = async () => {
    setInProgress(true);
    const newStoragePath = await open({ directory: true, defaultPath: await appDataDir() });
    if (newStoragePath) {
      onChange(newStoragePath instanceof Array ? newStoragePath[0] : newStoragePath);
    }
    setInProgress(false);
  };

  return (
    <button type="button" className={classNames(styles.root, inProgress && styles.inProgress, className)} onClick={handleClick} {...props}>
      {value}
    </button>
  );
}
