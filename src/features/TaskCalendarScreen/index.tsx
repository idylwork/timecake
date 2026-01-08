import classNames from 'classnames';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { dateTaskAtom, useFetchMonthTasks } from '../../atoms/dateTaskAtom';
import { useChangeDateTask } from '../../atoms/initializeAtom';
import { projectsAtom } from '../../atoms/projectsAtom';
import { ScreenMode, screenModeAtom } from '../../atoms/screenModeAtom';
import CalendarActionMenu from '../../components/CalendarActionMenu';
import ChartBar, { ChartStackValue } from '../../components/ChartBar';
import ScreenLayout from '../../components/ScreenLayout';
import Project from '../../models/Project';
import UnitTotal, { DateUnit } from '../../models/UnitTotal';
import YearTotal from '../../models/YearTotal';
import styles from './index.module.css';

/**
 * タスクの月別・年別カレンダー表示
 * @return
 */
export default function TaskCalendarScreen() {
  /** プロジェクトリスト */
  const projects = useAtomValue(projectsAtom);
  /** 画面表示モード */
  const setScreenMode = useSetAtom(screenModeAtom);
  /** 編集中日別タスク */
  const dateTask = useAtomValue(dateTaskAtom);
  /** カレンダーで閲覧中の月初日付 */
  const [calendarDate, setCalendarDate] = useState(new Date(dateTask.getYear(), dateTask.getMonth() - 1, 1));
  /** 日別の集計を1ヶ月分取得 */
  const fetchMonthTasks = useFetchMonthTasks();
  /** 編集する日付を変更 */
  const changeDateTask = useChangeDateTask();
  /** カレンダーの表示単位 */
  const [unit, setUnit] = useState<DateUnit>(DateUnit.Month);
  /** 選択中の絞り込みプロジェクト */
  const [project, setProject] = useState<Project | undefined>();
  /** 月間の統計データリスト (取得中はundefined) */
  const [unitTotal, setUnitTotal] = useState<UnitTotal | undefined>();
  /** 編集中の項目インデックス (月が違う場合は-1) */
  const activeIndex = useMemo(() => unitTotal?.dateIndexOf(dateTask.getDateInstance()) ?? -1, [unitTotal, dateTask]);
  /** 現在日時の項目インデックス (月が違う場合は-1) */
  const currentIndex = useMemo(() => unitTotal?.dateIndexOf(new Date()) ?? -1, [unitTotal]);
  /** 全プロジェクトの色別時間リスト */
  const [minutesByColor, setMinutesByColor] = useState<ChartStackValue[]>([]);
  /** 絞り込み中プロジェクトの時間リスト (未選択はundefined) */
  const [filteredMinutes, setFilteredMinutes] = useState<number[] | undefined>();
  /** 絞り込み中プロジェクトの最大時間 (未選択はundefined) */
  const [maxFilteredMinute, setMaxFilteredMinute] = useState<number | undefined>();

  /**
   * 項目選択時の動作
   * @param selection - 日付もしくは月
   */
  const selectItem = (selection: number) => {
    if (unit === DateUnit.Year) {
      setCalendarDate(new Date(calendarDate.getFullYear(), selection - 1, 1));
      setUnit(DateUnit.Month);
    } else {
      changeDateTask(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), selection));
      setScreenMode(ScreenMode.taskEditor);
    }
  };

  // 日付変更時にファイルから年・月間の集計データ取得
  useEffect(() => {
    (async () => {
      if (unit === DateUnit.Year) {
        let monthTotals = [];
        for (let month = 1; month <= 12; month += 1) {
          monthTotals.push(await fetchMonthTasks(calendarDate.getFullYear(), month));
        }
        setUnitTotal(new YearTotal({ year: calendarDate.getFullYear(), monthTotals }));
      } else {
        setUnitTotal(await fetchMonthTasks(calendarDate.getFullYear(), calendarDate.getMonth() + 1));
      }
    })();
  }, [calendarDate, unit]);

  // 集計データ読み込み時・絞り込み変更時にレイアウトを再計算
  useEffect(() => {
    if (!unitTotal) {
      setMinutesByColor([]);
      setFilteredMinutes(undefined);
      setMaxFilteredMinute(undefined);
      return;
    }

    if (project) {
      setFilteredMinutes(unitTotal.filterByProject(project.id));
      setMaxFilteredMinute(unitTotal.maxByProject.get(project.id) ?? 1);
    } else {
      setMinutesByColor(unitTotal.minutesByProjectColor(projects));
      setFilteredMinutes(undefined);
      setMaxFilteredMinute(undefined);
    }
  }, [unitTotal, project]);

  return (
    <ScreenLayout
      title={calendarDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric' })}
      titleClassName={styles.title}
      padding={false}
    >
      <CalendarActionMenu unit={unit} setUnit={setUnit} date={calendarDate} setDate={setCalendarDate} project={project} setProject={setProject} />

      {unitTotal && (
        <div className={classNames(styles.list, styles[unit])}>
          {filteredMinutes
            ? filteredMinutes.map((minute, index) => (
                <div onClick={() => selectItem(index + 1)} key={index}>
                  <ChartBar
                    label={`${index + 1}${unit === DateUnit.Year ? '月' : '日'}`}
                    annotation={`${(minute ?? 0) / 60}h`}
                    value={minute}
                    max={maxFilteredMinute ?? 1}
                    color={project?.color}
                    className={classNames(styles.bar, index === activeIndex && styles.active, index === currentIndex && styles.current)}
                  />
                </div>
              ))
            : minutesByColor.map((minute, index) => (
                <div onClick={() => selectItem(index + 1)} key={index}>
                  <ChartBar
                    label={`${index + 1}${unit === DateUnit.Year ? '月' : '日'}`}
                    value={minute}
                    max={unit === DateUnit.Month ? unitTotal.max : undefined}
                    className={classNames(styles.bar, index === activeIndex && styles.active, index === currentIndex && styles.current)}
                  />
                </div>
              ))}
        </div>
      )}
    </ScreenLayout>
  );
}
