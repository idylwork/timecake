import { useEffect, useMemo, useState } from 'react';
import Time from '../../models/Time';
import styles from './background.module.css';
import { PIXEL_PER_MINUTE } from '../../constants';

interface Props {
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * タスクリストの背景
 * @param props.onClick - クリック時の処理
 * @returns
 */
export default function TaskBlockListBackground({ onClick }: Props) {
  /** 現在時刻 */
  const [currentTime, setCurrentTime] = useState(new Time());
  /** 表示する時間リスト */
  const hours = useMemo(() => [...Array(24)].map((_, i) => i), []);

  useEffect(() => {
    // 現在時刻を一定期間ごとに更新
    const intervalId = setInterval(() => {
      setCurrentTime(new Time());
    }, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

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
      <div className={styles.currentTime} style={{ top: currentTime.valueOf() * PIXEL_PER_MINUTE }} />
    </div>
  );
};
