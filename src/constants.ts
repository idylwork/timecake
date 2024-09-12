/** 1分あたりの高さピクセル数 */
export const PIXEL_PER_MINUTE = 0.7;
/** 1プロジェクトあたりのオートコンプリート表示数 */
export const AUTO_COMPLETE_COUNT_BY_PROJECT = 5;
/** オートコンプリートの対象期間 (ファイル数) */
export const AUTO_COMPLETE_SPAN = 3;
/** 出力用テンプレート */
export const DEFAULT_OUTPUT_TEMPLATE =
  '```\n【日報】{{month}}/{{date}} {{startAt}}-{{endAt}}\n' +
  '{{#projects}}\n' +
  '・{{name}} {{description}} {{hours}}h\n' +
  '{{/projects}}\n' +
  '＜コメント＞\n' +
  '```\n';
/** タスク区切り文字 */
export const DEFAULT_TASK_SEPARATOR = '・';
/** タスク時間単位 */
export const DEFAULT_MINUTE_STEP = 30;
/** 現在時刻を更新する間隔 (秒) */
export const REFRESH_INTERVAL = 180
