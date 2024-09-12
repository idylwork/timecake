import { useState } from 'react';
import styles from './index.module.css';

interface Props {
  value: string;
  setValue: (newValue: string) => void;
}

/**
 * 1文字のみ受け付ける入力フォーム
 * @param props.value - 入力値
 * @param props.setValue - 入力変更時の処理
 * @return
 */
export function CharactorInput({ value, setValue }: Props) {
  /** IMEの入力が未確定か */
  const [isComposing, setIsComposing] = useState(false);

  /**
   * 入力変更時 (IME未確定の間のみ文字数の制限を解除)
   * @param event
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(isComposing ? event.currentTarget.value : event.currentTarget.value.at(-1) ?? '');
  };

  /**
   * フォーカス解除時・IME変換完了時
   * @param event
   */
  const handleBlur = (event: React.SyntheticEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value.at(-1) ?? '');
    setIsComposing(false);
  };

  /**
   * IMEによる入力開始時
   */
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  return (
    <input
      type="text"
      className={styles.root}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleBlur}
    />
  );
}
