import { useAtom, useSetAtom } from 'jotai';
import ScreenLayout, { ScreenActions } from '../ScreenLayout';
import styles from './index.module.css';
import { ScreenMode, displayModeAtom, outputTemplateAtom, taskSeparatorAtom } from '../../atoms/dateTaskState';
import { CheckIcon } from '@radix-ui/react-icons';
import Button from '../Button';
import { CharactorInput } from '../CharactorInput';
import HighlightedTextArea from '../HighlightedTextArea';
import { useRef } from 'react';

export default function PreferenceScreen() {
  /** 画面表示モード */
  const setDisplayingMode = useSetAtom(displayModeAtom);
  /** 出力用テンプレート */
  const [outputTemplate, setOutputTemplate] = useAtom(outputTemplateAtom);
  /** タスク区切り文字 */
  const [taskSeparator, setTaskSeparator] = useAtom(taskSeparatorAtom);
  /** 出力用テンプレートテキストエリアの参照 */
  const outputTemplateRef = useRef<HTMLTextAreaElement>(null);

  /**
   * 出力用テンプレートに文字列を挿入
   */
  const handleOutputTemplateButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const textarea = outputTemplateRef.current;
    if (!textarea) return;

    const text = event.currentTarget.dataset.text ?? '';
    const index = textarea.selectionEnd;
    setOutputTemplate(`${outputTemplate.slice(0, index)}${text}${outputTemplate.slice(index)}`);
    textarea.focus();
    setTimeout(() => {
      textarea.selectionStart = index;
      textarea.selectionEnd = index + text.length;
    }, 0);
  }

  return (
    <ScreenLayout title="アプリケーション設定">
      <label className={styles.label}>
        <div className={styles.heading}>出力用テンプレート</div>
        <HighlightedTextArea value={outputTemplate} setValue={setOutputTemplate} className={styles.textarea} ref={outputTemplateRef} />
        <div className={styles.textareaActions}>
          <Button size="small" data-text="{{month}}" onClick={handleOutputTemplateButtonClick}>月</Button>
          <Button size="small" data-text="{{date}}" onClick={handleOutputTemplateButtonClick}>日</Button>
          <Button size="small" data-text="{{startAt}}" onClick={handleOutputTemplateButtonClick}>開始時刻</Button>
          <Button size="small" data-text="{{endAt}}" onClick={handleOutputTemplateButtonClick}>開始時刻</Button>
          <Button size="small" data-text="{{#projects}}\n・{{name}} {{description}} {{hours}}h\n{{/projects}}" onClick={handleOutputTemplateButtonClick}>プロジェクトリスト</Button>
        </div>
      </label>

      <label className={styles.label}>
        <div className={styles.heading}>タスク区切り文字</div>
        <CharactorInput value={taskSeparator} setValue={setTaskSeparator} />
      </label>
      <ScreenActions>
        <Button size="large" className={styles.ok} icon={<CheckIcon />} onClick={() => setDisplayingMode(ScreenMode.taskEditor)}>OK</Button>
      </ScreenActions>
    </ScreenLayout>
  );
}
