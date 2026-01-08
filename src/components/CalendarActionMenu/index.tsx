import { ChevronLeftIcon, ChevronRightIcon, CopyIcon, Cross2Icon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useGenerateMonthTaskOutput } from '../../atoms/dateTaskAtom';
import { ScreenMode, screenModeAtom } from '../../atoms/screenModeAtom';
import Project from '../../models/Project';
import { DateUnit } from '../../models/UnitTotal';
import Button, { ButtonGroup } from '../Button';
import ProjectSelectorPopover from '../ProjectSelectorPopover';
import styles from './index.module.css';

interface Props {
  children?: React.ReactNode;
  unit: DateUnit;
  setUnit: (unit: DateUnit) => void;
  date: Date;
  setDate: (date: Date) => void;
  project: Project | undefined;
  setProject: (project: Project | undefined) => void;
}

/**
 * カレンダーの操作メニュー
 * @param props.children -
 * @return
 */
export default function CalendarActionMenu({ children, unit, setUnit, date, setDate, project, setProject }: Props) {
  /** 画面表示モード */
  const setScreenMode = useSetAtom(screenModeAtom);
  /** プロジェクトを選択中か */
  const [isProjectSelecting, setIsProjectSelecting] = useState(false);
  /** 出力用文字列を生成 */
  const generateMonthTaskOutput = useGenerateMonthTaskOutput();

  /**
   * プロジェクト選択時
   * @param project
   */
  const handleProjectChange = (project: Project | undefined) => {
    setIsProjectSelecting(false);
    setProject(project);
  };

  /**
   * 年を移動
   * @param diff - 移動する日数 (未指定で本日)
   */
  const changeDate = async (diff: number | undefined = undefined) => {
    if (diff === undefined) {
      const now = new Date();
      if (unit === DateUnit.Year) {
        setDate(new Date(now.getFullYear(), date.getMonth(), 1));
      } else {
        setDate(new Date(now.getFullYear(), now.getMonth(), 1));
      }
    } else {
      if (unit === DateUnit.Year) {
        setDate(new Date(date.getFullYear() + diff, date.getMonth(), 1));
      } else {
        setDate(new Date(date.getFullYear(), date.getMonth() + diff, 1));
      }
    }
  };

  /**
   * 出力用文字列を作成してクリップボードにコピー
   */
  const copyToClipboard = async () => {
    const text = await generateMonthTaskOutput(date);
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={styles.root}>
      <ButtonGroup>
        <Button size="small" icon={<ChevronLeftIcon />} onClick={() => changeDate(-1)}></Button>
        <Button size="small" complete="Jump!" onClick={() => changeDate()}>
          {unit === DateUnit.Year ? '今年' : '今月'}
        </Button>
        <Button size="small" icon={<ChevronRightIcon />} onClick={() => changeDate(1)}></Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button size="small" onClick={() => setUnit(DateUnit.Year)} disabled={unit === DateUnit.Year}>
          年
        </Button>
        <Button size="small" onClick={() => setUnit(DateUnit.Month)} disabled={unit === DateUnit.Month}>
          月
        </Button>
        <Button size="small" onClick={() => setScreenMode(ScreenMode.taskEditor)}>
          日
        </Button>
      </ButtonGroup>
      <Button size="small" icon={<CopyIcon />} complete="Copied!" onClick={copyToClipboard} disabled={unit !== DateUnit.Month}>
        コピー
      </Button>
      <div className={styles.project}>
        <ProjectSelectorPopover open={isProjectSelecting} className={styles.projectPopover} onChange={handleProjectChange} />
        <Button
          size="small"
          icon={project && <Cross2Icon />}
          className={classNames(styles.projectButton, project && styles.selected)}
          onClick={() => (project ? setProject(undefined) : setIsProjectSelecting(true))}
        >
          {project?.name ?? '全プロジェクト'}
        </Button>
      </div>
      {children}
    </div>
  );
}
