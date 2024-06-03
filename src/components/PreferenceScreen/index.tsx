import { useAtom, useSetAtom } from 'jotai';
import ScreenLayout, { ScreenActions } from '../ScreenLayout';
import styles from './index.module.css';
import { ScreenMode, MinuteStep, screenModeAtom, outputTemplateAtom, taskSeparatorAtom, minuteStepAtom } from '../../atoms/dateTaskState';
import { CheckIcon } from '@radix-ui/react-icons';
import Button from '../Button';
import { CharactorInput } from '../CharactorInput';
import HighlightedTextArea from '../HighlightedTextArea';
import { useRef } from 'react';
import NavigationTab from '../NavigationTab';

/**
 * アプリケーション設定画面
 * @returns
 */
export default function PreferenceScreen() {
  /** 画面表示モード */
  const setScreenMode = useSetAtom(screenModeAtom);
  /** 出力用テンプレート */
  const [outputTemplate, setOutputTemplate] = useAtom(outputTemplateAtom);
  /** タスク区切り文字 */
  const [taskSeparator, setTaskSeparator] = useAtom(taskSeparatorAtom);
  /** タスク時間単位 */
  const [minuteStep, setMinuteStep] = useAtom(minuteStepAtom);
  /** 出力用テンプレートテキストエリアの参照 */
  const outputTemplateRef = useRef<HTMLTextAreaElement>(null);

  /**
   * 出力用テンプレートに文字列を挿入
   */
  const handleOutputTemplateButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const textarea = outputTemplateRef.current;
    if (!textarea) return;

    const text = event.currentTarget.dataset.text?.replace(/\\n/g, '\n') ?? '';
    const index = textarea.selectionEnd;
    setOutputTemplate(`${outputTemplate.slice(0, index)}${text}${outputTemplate.slice(index)}`);
    textarea.focus();
    setTimeout(() => {
      textarea.selectionStart = index;
      textarea.selectionEnd = index + text.length;
    }, 0);
  };

  /**
   * タスク時間単位変更時の処理
   * @param event
   */
  const handleMinuteStepChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMinuteStep(Number(event.currentTarget.value) as MinuteStep)
  };

  return (
    <ScreenLayout title="アプリケーション設定">
      <NavigationTab items={{'一般': ScreenMode.preference, 'プロジェクト': ScreenMode.projectSetting }} selection={ScreenMode.preference} onChange={(screenMode) => setScreenMode(screenMode)} />
      <label className={styles.label}>
        <div className={styles.heading}>出力用テンプレート</div>
        <HighlightedTextArea value={outputTemplate} setValue={setOutputTemplate} className={styles.textarea} ref={outputTemplateRef} />
        <div className={styles.textareaActions}>
          <Button size="small" data-text="{{month}}" onClick={handleOutputTemplateButtonClick}>月</Button>
          <Button size="small" data-text="{{date}}" onClick={handleOutputTemplateButtonClick}>日</Button>
          <Button size="small" data-text="{{startAt}}" onClick={handleOutputTemplateButtonClick}>開始時刻</Button>
          <Button size="small" data-text="{{endAt}}" onClick={handleOutputTemplateButtonClick}>開始時刻</Button>
          <Button size="small" data-text="{{#projects}}\n・{{name}} {{description}} {{hours}}h\n{{/projects}}" onClick={handleOutputTemplateButtonClick}>プロジェクト一覧</Button>
        </div>
        <div className={styles.description}>コピー時の文章形式。プレースホルダは下部ボタンで挿入可能で、実際のタスク内容に変換されます。</div>
      </label>

      <label className={styles.label}>
        <div className={styles.heading}>タスク区切り文字</div>
        <CharactorInput value={taskSeparator} setValue={setTaskSeparator} />
        <div className={styles.description}>タスク詳細の区切り文字。コピー時の文章形式やタスクの重複チェックなどに使用されます。</div>
      </label>

      <label className={styles.label}>
        <div className={styles.heading}>タスク時間単位</div>
        <select className={styles.select} defaultValue={minuteStep} onChange={handleMinuteStepChange}>
          {MinuteStep.map((minute) => (
            <option value={minute} key={minute}>{minute}分</option>
          ))}
        </select>
        <div className={styles.description}>タスク時間の最小単位。</div>
      </label>

      <ScreenActions>
        <Button size="large" className={styles.ok} icon={<CheckIcon />} onClick={() => setScreenMode(ScreenMode.taskEditor)}>OK</Button>
      </ScreenActions>
    </ScreenLayout>
  );
}
