import classNames from 'classnames';
import Title from '../Title';
import styles from './index.module.css';

interface Props {
  title: string;
  titleClassName?: string;
  padding?: boolean;
  children: React.ReactNode;
}

/**
 * レイアウト
 * @param props.title - タイトル
 * @return
 */
export default function ScreenLayout({ title, padding = true, titleClassName, children }: Props) {
  return (
    <div className={styles.root}>
      <Title className={titleClassName}>{title}</Title>
      <main className={classNames(styles.main, padding && styles.padding)}>{children}</main>
    </div>
  );
}

/**
 * レイアウト下部のボタン配置部
 * @param props.children
 * @returns
 */
export function ScreenActions({ children }: { children?: React.ReactNode }) {
  return (
    <div className={styles.actions}>
      <div className={styles.actionsContainer}>{children}</div>
    </div>
  );
}
