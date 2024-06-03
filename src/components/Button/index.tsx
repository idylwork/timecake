import { useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.css';

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'middle' | 'large';
  icon?: React.ReactNode;
  complete?: string;
}

/**
 * ボタン
 *
 * @param props - buttonタグと共通
 * @returns
 */
export default function Button({ icon = null, size = 'middle', complete = '', className, onClick, children, ...props }: Props) {
  /** 完了時の表示をするか */
  const [isComplete, setIsComplete] = useState(false);

  /**
   * クリック時の処理
   *
   * @param event
   * @returns
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;
    onClick(event);
    setIsComplete(true);
    setTimeout(() => {
      setIsComplete(false);
    }, 1000)
  };

  return (
    <button type="button" className={classNames(styles.root, styles[size], className)} onClick={handleClick} {...props}>
      {icon && (
        <div className={styles.icon}>{icon}</div>
      )}
      {children}
      {complete && <div className={classNames(styles.complete, isComplete && styles.isComplete)}>{complete}</div>}
    </button>
  );
}

interface GroupProps {
  children: React.ReactNode;
}

/**
 * ボタングループコンポーネント
 * @param props.children
 * @returns
 */
export function ButtonGroup({ children }: GroupProps) {
  return (
    <div className={styles.group}>
      {children}
    </div>
  );
}
