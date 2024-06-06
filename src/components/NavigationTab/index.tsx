import React, { useId } from 'react';
import styles from './index.module.css';

interface Props<T> {
  items: { [key: string]: T };
  selection: T;
  onChange: (item: T) => void;
}

/**
 * ナビゲーションタブコンポーネント
 * @param props.items - タブのラベルとクリック時の処理リスト
 * @return
 */
function NavigationTab<T>({ items, selection, onChange }: Props<T>) {
  const id = useId();
  /**
   * クリック時の処理
   * @param event
   */
  const handleClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const itemKey = event.currentTarget.value;
    if (!itemKey) return;
    onChange(items[itemKey]);
  };

  return (
    <div className={styles.root}>
      {Object.keys(items).map((itemKey) => (
        <label key={itemKey} className={styles.item}>
          <input type="radio" name={id} className={styles.input} onChange={handleClick} value={itemKey} checked={items[itemKey] === selection} />
          <span className={styles.button}>{itemKey}</span>
        </label>
      ))}
    </div>
  );
}

export default React.memo(NavigationTab) as typeof NavigationTab;
