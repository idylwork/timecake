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
 * @param options - 日付フォーマットのオプション
 * @returns YYYY-MM-DD形式
 */
export const dateToString = (date: Date, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }) => {
  return date.toLocaleDateString('ja-JP', options).replaceAll('/', '-');
};
