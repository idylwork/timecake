import classNames from 'classnames';
import styles from './index.module.css';

interface Props extends React.HTMLProps<HTMLInputElement> {
}

/**
 * トグルスイッチ型入力フォーム
 * @param param0 
 * @returns 
 */
export default function ToggleInput({ children, className, ...props }: Props) {
  return (
    <label className={styles.root}>
      <input className={classNames(styles.input, className)} {...props} type="checkbox" />
      <div className={styles.background}></div>      
      {children}
    </label>
  );
};
