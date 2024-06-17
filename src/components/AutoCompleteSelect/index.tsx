import classNames from 'classnames';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { taskBodyLogsAtom } from '../../atoms/dateTaskState';
import styles from './index.module.css';

interface Props extends HTMLElementStandardProps {
  projectId: string | undefined;
  open: boolean;
  onChange: (body: string) => void;
}

/**
 *
 * @param props.children - 子要素
 * @param props.projectId - プロジェクトID
 * @return
 */
export default function AutoCompleteSelect({ children, open, projectId, onChange, className, ...props }: Props) {
  /** プロジェクトID毎のタスク名 */
  const taskBodyLogs = useAtomValue(taskBodyLogsAtom);
  /** オートコンプリートリスト */
  const taskBodies = useMemo(() => (projectId && projectId in taskBodyLogs ? taskBodyLogs[projectId] : []), [projectId]);

  return (
    <div className={classNames(styles.root, className)} {...props}>
      {children}
      <dialog className={styles.dialog} open={open}>
        {taskBodies.map((taskBody, index) => (
          <div className={styles.item} onMouseDown={() => onChange(taskBody)} key={index}>
            {taskBody}
          </div>
        ))}
      </dialog>
    </div>
  );
}
