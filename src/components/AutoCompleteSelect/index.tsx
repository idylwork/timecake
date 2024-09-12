import classNames from 'classnames';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { autoCompleteLogAtom } from '../../atoms/autoCompleteLogAtom';
import styles from './index.module.css';

interface Props extends HTMLElementStandardProps {
  projectId: string | undefined;
  open: boolean;
  onChange: (body: string) => void;
  onFocus?: React.MouseEventHandler;
}

/**
 * 子要素にオートコンプリート機能を付加する
 * @param props.children - 子要素
 * @param props.projectId - プロジェクトID
 * @return
 */
export default function AutoCompleteSelect({ children, open, projectId, onChange, className, onFocus, ...props }: Props) {
  /** プロジェクトID毎のタスク名 */
  const autocompleteLog = useAtomValue(autoCompleteLogAtom);
  /** オートコンプリートリスト */
  const bodyLogs = useMemo(() => (projectId && projectId in autocompleteLog.logs ? [...autocompleteLog.logs[projectId].values()] : []), [projectId]);

  return (
    <div className={classNames(styles.root, className)} onClick={onFocus} {...props}>
      {children}
      <dialog className={styles.dialog} open={open && bodyLogs.length > 0}>
        {bodyLogs.map((bodyLog, index) => (
          <div className={styles.item} onMouseDown={() => onChange(bodyLog.value)} key={index}>
            {bodyLog.value}
          </div>
        ))}
      </dialog>
    </div>
  );
}
