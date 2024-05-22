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
  /**
   * 入力変更時
   * @param event
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
  };

  /**
   * フォーカス解除時
   * @param event
   */
  const handleBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value.at(-1) ?? '');
  };

  return (
    <input type="text" className={styles.root} value={value} onChange={handleChange} onBlur={handleBlur} />
  );
}
