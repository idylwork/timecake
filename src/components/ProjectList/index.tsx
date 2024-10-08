import { Cross1Icon, PlusIcon } from '@radix-ui/react-icons';
import { useAtom } from 'jotai';
import { useRef } from 'react';
import { projectsAtom, useWriteProjectsFile } from '../../atoms/projectsAtom';
import useDelayEffect from '../../hooks/useDelayEffect';
import useUpdateEffect from '../../hooks/useUpdateEffect';
import Color from '../../models/Color';
import Project from '../../models/Project';
import ToggleInput from '../ToggleInput';
import styles from './index.module.css';

export default function ProjectList() {
  /** プロジェクトリスト */
  const [projects, setProjects] = useAtom(projectsAtom);
  /** プロジェクトリストのファイル書き込み */
  const writeProjectsFile = useWriteProjectsFile();
  /** 未保存の変更があるか */
  const isChangedRef = useRef<boolean | undefined>(undefined);

  /**
   * プロジェクトを新規追加する
   */
  const appendProject = () => {
    setProjects([
      ...projects,
      new Project({
        name: '新しいプロジェクト',
        color: new Color('#cccccc'),
        isAvailable: true,
      }),
    ]);
  };

  /**
   * プロジェクト名変更時の処理
   * @param event
   * @returns
   */
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const index = Number(event.currentTarget.dataset.projectIndex ?? -1);
    const project = projects[index];
    if (!project) return;

    const newProjects = [...projects];
    newProjects.splice(index, 1, new Project({ ...project, name: event.currentTarget.value }));
    setProjects(newProjects);
  };

  /**
   * プロジェクト色変更時の処理
   * @param event
   * @returns
   */
  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const index = Number(event.currentTarget.dataset.projectIndex ?? -1);
    const project = projects[index];
    if (!project) return;

    const newProjects = [...projects];
    newProjects.splice(index, 1, new Project({ ...project, color: event.currentTarget.value }));
    setProjects(newProjects);
  };

  /**
   * 指定したインデックスのプロジェクトを削除
   * @param index
   */
  const removeProject = (index: number) => {
    const newProjects = [...projects];
    newProjects.splice(index, 1);
    setProjects(newProjects);
  };

  /**
   * プロジェクトの有効化フラグ変更時の処理
   * @param event
   * @returns
   */
  const handleIsAvailableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const index = Number(event.currentTarget.dataset.projectIndex ?? -1);
    const project = projects[index];
    if (!project) return;

    const newProjects = [...projects];
    newProjects.splice(index, 1, new Project({ ...project, isAvailable: event.currentTarget.checked }));
    setProjects(newProjects);
  };

  useDelayEffect(
    () => {
      // データの更新があったら少し待ってからファイル書き込み
      writeProjectsFile();
      isChangedRef.current = false;
    },
    [projects],
    {
      onStart: () => {
        // コンポーネント初期化時は変更なし
        isChangedRef.current = isChangedRef.current === undefined ? false : true;
      },
      delay: 3000,
    }
  );

  useUpdateEffect(() => {
    return () => {
      if (isChangedRef.current) {
        writeProjectsFile();
      }
    };
  }, []);

  return (
    <div>
      {projects.map((project, index) => (
        <div className={styles.item} key={project.id}>
          <input type="color" value={project.color.toString()} onChange={handleColorChange} data-project-index={index} />
          <input
            type="text"
            className={styles.name}
            value={project.name}
            placeholder="プロジェクト名"
            onChange={handleNameChange}
            data-project-index={index}
            disabled={!project.isAvailable}
          />
          <ToggleInput checked={project.isAvailable} data-project-index={index} onChange={handleIsAvailableChange} />
          <button type="button" onClick={() => removeProject(index)}>
            <Cross1Icon />
          </button>
        </div>
      ))}
      <div className={styles.item}>
        <button type="button" className={styles.append} onClick={appendProject}>
          <PlusIcon />
          <div>追加</div>
        </button>
      </div>
    </div>
  );
}
