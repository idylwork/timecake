import { CheckIcon, OpenInNewWindowIcon } from '@radix-ui/react-icons';
import { invoke } from '@tauri-apps/api';
import { confirm } from '@tauri-apps/api/dialog';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useRef } from 'react';
import {
  MinuteStep,
  minuteStepAtom,
  outputTemplateAtom,
  storagePathAtom,
  taskSeparatorAtom,
  useMoveStoragePathWithFile,
  useResetPreferences,
} from '../../atoms/preferenceAtom';
import { ScreenMode, screenModeAtom } from '../../atoms/screenModeAtom';
import Button, { ButtonGroup } from '../Button';
import { CharactorInput } from '../CharactorInput';
import Form from '../Form';
import HighlightedTextArea from '../HighlightedTextArea';
import NavigationTab from '../NavigationTab';
import PathInput from '../PathInput';
import ScreenLayout, { ScreenActions } from '../ScreenLayout';
import styles from './index.module.css';

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
  /** データ保存先パス */
  const storagePath = useAtomValue(storagePathAtom);
  /** データ保存先とファイルを移動 */
  const moveStoragePath = useMoveStoragePathWithFile();
  /** 設定を初期化する */
  const resetPreferences = useResetPreferences();

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
    setMinuteStep(Number(event.currentTarget.value) as MinuteStep);
  };

  /**
   * データ保管先変更時の処理
   * @param newStoragePath
   */
  const handleStoragePathChange = async (newStoragePath: string) => {
    await moveStoragePath(newStoragePath);
  };

  /**
   * タスクの保管先を開く
   */
  const revealStoragePath = () => {
    invoke('reveal_file', { path: storagePath });
  };

  /**
   * 確認をして設定をリセットする
   */
  const confirmToResetPreferences = async () => {
    if (
      !(await confirm('設定をリセットしますか？\nプロジェクトやタスクの設定はファイル管理されているため保持されます。', {
        okLabel: 'リセット',
        title: '設定のリセット',
        type: 'warning',
      }))
    )
      return;
    await resetPreferences();
  };

  return (
    <ScreenLayout title="アプリケーション設定">
      <NavigationTab
        items={{
          一般: ScreenMode.preference,
          プロジェクト: ScreenMode.projectSetting,
        }}
        selection={ScreenMode.preference}
        onChange={(screenMode) => setScreenMode(screenMode)}
      />
      <Form>
        <label className={styles.label}>
          <div className={styles.heading}>出力用テンプレート</div>
          <HighlightedTextArea
            ref={outputTemplateRef}
            value={outputTemplate}
            setValue={setOutputTemplate}
            className={styles.textarea}
            maxLength={1000}
          />
          <div className={styles.textareaActions}>
            <ButtonGroup>
              <Button size="small" data-text="{{year}}" onClick={handleOutputTemplateButtonClick}>
                年
              </Button>
              <Button size="small" data-text="{{month}}" onClick={handleOutputTemplateButtonClick}>
                月
              </Button>
              <Button size="small" data-text="{{date}}" onClick={handleOutputTemplateButtonClick}>
                日
              </Button>
              <Button size="small" data-text="{{weekday}}" onClick={handleOutputTemplateButtonClick}>
                曜日
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button size="small" data-text="{{startAt}}" onClick={handleOutputTemplateButtonClick}>
                開始時刻
              </Button>
              <Button size="small" data-text="{{endAt}}" onClick={handleOutputTemplateButtonClick}>
                終了時刻
              </Button>
            </ButtonGroup>
            <Button
              size="small"
              data-text="{{#projects}}\n{{name}} {{description}} {{hours}}\n{{/projects}}"
              onClick={handleOutputTemplateButtonClick}
            >
              プロジェクト一覧
            </Button>
          </div>
          <div className={styles.description}>コピー時の文章形式。プレースホルダは下部ボタンで挿入可能で、出力時にタスク内容に変換されます。</div>
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
              <option value={minute} key={minute}>
                {minute}分
              </option>
            ))}
          </select>
          <div className={styles.description}>タスク時間の最小単位。</div>
        </label>

        <label className={styles.label}>
          <div className={styles.heading}>データの保管先</div>
          <ButtonGroup>
            <PathInput value={storagePath} onChange={handleStoragePathChange} />

            <Button onClick={revealStoragePath}>
              <OpenInNewWindowIcon />
            </Button>
          </ButtonGroup>
          <div className={styles.description}>プロジェクトやタスクのデータを保管するフォルダパスを指定します。</div>
        </label>

        <label className={styles.label}>
          <div className={styles.heading}>設定管理</div>

          <div className={styles.row}>
            <Button size="small" onClick={confirmToResetPreferences}>
              設定のリセット
            </Button>
            <div className={styles.description}>一般設定を初期状態にリセットします。</div>
          </div>
        </label>
      </Form>

      <ScreenActions>
        <Button size="large" className={styles.ok} icon={<CheckIcon />} onClick={() => setScreenMode(ScreenMode.taskEditor)}>
          OK
        </Button>
      </ScreenActions>
    </ScreenLayout>
  );
}
