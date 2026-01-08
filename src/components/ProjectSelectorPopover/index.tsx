import classNames from 'classnames';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { projectsAtom } from '../../atoms/projectsAtom';
import { ScreenMode, screenModeAtom } from '../../atoms/screenModeAtom';
import Project from '../../models/Project';
import styles from './index.module.css';

interface Props {
  open: boolean;
  className?: string;
  onChange: (project: Project | undefined) => void;
}

/**
 * プロジェクトを選択するポップオーバー
 */
export default function ProjectSelectorPopover({ open, className, onChange }: Props) {
  /** プロジェクトリスト */
  const projects = useAtomValue(projectsAtom);
  /** 画面表示モード */
  const setScreenMode = useSetAtom(screenModeAtom);
  /** 有効化されているプロジェクトのみのリスト */
  const availableProjects = useMemo(() => projects.filter((project) => project.isAvailable), [projects]);

  /**
   * プロジェクト選択を変更
   * @param event
   */
  const handleProjectClick = (event: React.MouseEvent<HTMLElement>) => {
    const newProjectId = event.currentTarget.dataset.projectId ?? '';
    const newProject = projects.find((project) => project.id === newProjectId);
    if (!newProject) return;
    onChange(newProject);
  };

  /**
   * プロジェクト設定を選択
   */
  const handleSettingClick = () => {
    setScreenMode(ScreenMode.projectSetting);
  };

  // 開いた状態でどこかをクリックすると閉じる
  useEffect(() => {
    if (!open) return;

    /**
     * ダイアログを閉じる
     */
    const close = () => {
      onChange(undefined);
    };

    window.addEventListener('click', close, { capture: true });
    return () => {
      window.removeEventListener('click', close, { capture: true });
    };
  }, [open]);

  return (
    <div className={classNames(styles.root, className)}>
      <dialog open={open} className={classNames(styles.dialog)}>
        <div className={styles.list}>
          {availableProjects.map((project) => (
            <button type="button" className={styles.listItem} data-project-id={project.id} onClick={handleProjectClick} key={project.id}>
              <div className={styles.badge} style={{ backgroundColor: project.color.toString() }}></div>
              {project.name}
            </button>
          ))}
          <div className={styles.separator} />
          <button type="button" className={styles.listItem} onClick={handleSettingClick}>
            <div className={styles.badge}></div>
            編集
          </button>
        </div>
      </dialog>
    </div>
  );
}
