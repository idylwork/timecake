/**
 * 時刻情報
 * 時間と分のみ保持する
 */
export default class Time {
  static MAX = new Time(1440);
  /** 時間 */
  hour: number;
  /** 分 */
  minute: number;

  /**
   * 文字列からインスタンス化
   * @param text `:`区切りの時刻文字列
   * @returns `Time`オブジェクト
   */
  static parse(text: string) {
    const [hour, minute = '0'] = text.split(':');
    return new Time(Number(hour) * 60 + Number(minute));
  }

  /**
   * コンストラクタ
   * @param timeOrMinutes - 分、または時刻文字列
   */
  constructor(timeOrMinutes: string | number | { hour: number, minute: number } | null = null) {
    let minutes = 0;
    if (typeof timeOrMinutes === 'string') {
      const chunks = (timeOrMinutes as string).split(':');
      minutes = Number(chunks[0]) * 60 + Number(chunks[1] ?? '0')
    } else if (typeof timeOrMinutes === 'number') {
      minutes = timeOrMinutes;
    } else if (timeOrMinutes === null) {
      const now = new Date();
      minutes = now.getHours() * 60 + now.getMinutes();
    } else {
      minutes = timeOrMinutes.hour * 60 + timeOrMinutes.minute;
    }

    this.hour = Math.floor(minutes / 60);
    this.minute = minutes % 60;
  }

  /**
   * 時刻を加算したTimeインスタンスを返す
   * @param minute - 加算する分数
   */
  toAdded(minute: number = 0) {
    return new Time(this.hour * 60 + this.minute + minute);
  }

  /**
   * 文字列変換
   * @returns `h:mm`形式の文字列
   */
  toString() {
    return `${this.hour}:${String(this.minute).padStart(2, '0')}`;
  }

  /**
   * 分単位のタイムスタンプを返す (比較時に使用)
   * @returns
   */
  valueOf() {
    return this.hour * 60 + this.minute;
  }
}
