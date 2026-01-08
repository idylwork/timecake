import { useEffect, useMemo, useState } from 'react';
import { PIXEL_PER_MINUTE, REFRESH_INTERVAL } from '../../constants';
import Time from '../../models/Time';
import { dateToString } from '../../utils/Date';
import styles from './background.module.css';

interface Props {
  date: string;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * タスクリストの背景
 * @param props.onClick - クリック時の処理
 * @returns
 */
export default function TaskBlockListBackground({ date, onClick }: Props) {
  /** 現在時刻 (日付が違う場合はundefined) */
  const [currentTime, setCurrentTime] = useState<Time | undefined>(undefined);
  /** 表示する時間リスト */
  const hours = useMemo(() => [...Array(24)].map((_, i) => i), []);

  useEffect(() => {
    /**
     * 現在時刻を更新
     */
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime(dateToString(now) === date ? new Time(now) : undefined);
    }

    updateCurrentTime();
    const intervalId = setInterval(updateCurrentTime, REFRESH_INTERVAL * 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [date]);

  return (
    <div className={styles.root}>
      <div onClick={onClick}>
        {hours.map((hour) => (
          <div className={styles.timeSpan} style={{ height: `${60 * PIXEL_PER_MINUTE}px` }} key={hour}>
            <time className={styles.time}>{hour}:00</time>
            <div className={styles.line} />
          </div>
        ))}
      </div>
      {currentTime && <div className={styles.currentTime} style={{ top: currentTime.valueOf() * PIXEL_PER_MINUTE }} />}
    </div>
  );
}
