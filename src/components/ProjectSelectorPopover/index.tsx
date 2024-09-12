import classNames from 'classnames';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { projectsAtom } from '../../atoms/projectsAtom';
import { ScreenMode, screenModeAtom } from '../../atoms/screenModeAtom';
import Project from '../../models/Project';
import styles from './index.module.css';

interface Props {
  open: boolean;
  onChange: (project: Project | null) => void;
}

/**
 * プロジェクトを選択するポップオーバー
 */
export default function ProjectSelectorPopover({ open, onChange }: Props) {
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
    const newProjectIndex = Number(event.currentTarget.dataset.projectIndex ?? -1);
    if (newProjectIndex < 0) return;
    onChange(projects[newProjectIndex]);
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
      onChange(null);
    };

    window.addEventListener('click', close, { capture: true });
    return () => {
      window.removeEventListener('click', close);
    };
  }, [open]);

  return (
    <div className={styles.root}>
      <dialog open={open} className={classNames(styles.dialog)}>
        <div className={styles.list}>
          {availableProjects.map((project, index) => (
            <button type="button" className={styles.listItem} data-project-index={index} onClick={handleProjectClick} key={project.id}>
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
