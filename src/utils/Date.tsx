/**
 * 時間を0:00:00に固定して日付を取得する
 * @param date - 変換するDateオブジェクト (未指定で今日)
 */
export const dateWithoutTime = (date: Date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * 日付を文字列に変換する
 * @param date
 * @returns YYYY-MM-DD形式
 */
export const dateToString = (date: Date) => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};
