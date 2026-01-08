import classNames from 'classnames';
import React, { useMemo } from 'react';
import Color from '../../models/Color';
import styles from './index.module.css';

export type ChartStackValue = Map<Color, number>;

type Props = {
  label?: string;
  annotation?: string;
  value: number | ChartStackValue;
  max?: number;
  color?: Color;
  className?: string;
}

/**
 * 棒グラフ
 * @param props.name - 項目名
 * @param props.label - ラベル
 * @param props.value - 値 (色をキーとしたMapの場合は積み上げグラフとして表示)
 * @param props.color - 色
 * @param props.max - 最大値 (未設定で100%)
 * @param props.className - CSSクラス名
 * @return
 */
export default React.memo(function ChartBar({ label, annotation = '', value, max, color, className }: Props) {
  /** グラフの割合 (0-100) */
  const parcentage = useMemo(() => value instanceof Map ? 100 : value / (max ?? 1) * 100, [value, max]);
  /** 最大値 */
  const maxValue = useMemo(() => max ?? (value instanceof Map ? [...value.values()].reduce((prev, current) => prev + current, 0) : value), [max, value]);

  return (
    <div className={classNames(styles.root, color?.isDark && styles.isDark, className)}>
      {label && <div className={styles.name}>{label}</div>}

      {value instanceof Map ? (
        <div className={styles.line}>
          {[...value.entries()].map(([stackColor, value]) => (
            <div className={styles.bar} style={{ width: `${value / maxValue * 100}%`, backgroundColor: (color ?? stackColor).toString() }} key={stackColor.toString()} />
          ))}
          <span className={styles.label}>{annotation}</span>
        </div>
      ) : (
        <div className={styles.line}>
          <div className={styles.bar} style={{ width: `${parcentage}%`, backgroundColor: color?.toString() ?? 'clear' }} />
          <span className={classNames(styles.label, parcentage < 10 && styles.isSmall )}>{annotation}</span>
        </div>
      )}
    </div>
  )
});
