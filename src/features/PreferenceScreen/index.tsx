import { CheckIcon, OpenInNewWindowIcon } from '@radix-ui/react-icons';
import { invoke } from '@tauri-apps/api';
import { confirm } from '@tauri-apps/api/dialog';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  MinuteStep,
  minuteStepAtom,
  monthlyOutputTemplateAtom,
  outputTemplateAtom,
  storagePathAtom,
  taskSeparatorAtom,
  useMoveStoragePathWithFile,
  useResetPreferences,
} from '../../atoms/preferenceAtom';
import { ScreenMode, screenModeAtom } from '../../atoms/screenModeAtom';
import Button, { ButtonGroup } from '../../components/Button';
import { CharactorInput } from '../../components/CharactorInput';
import Form from '../../components/Form';
import HighlightedTextArea, { useInsertToHighlightedTextArea } from '../../components/HighlightedTextArea';
import NavigationTab from '../../components/NavigationTab';
import PathInput from '../../components/PathInput';
import ScreenLayout, { ScreenActions } from '../../components/ScreenLayout';
import styles from './index.module.css';

/**
 * アプリケーション設定画面
 * @returns
 */
export default function PreferenceScreen() {
  /** 画面表示モード */
  const setScreenMode = useSetAtom(screenModeAtom);
  /** 日別出力用テンプレート */
  const [outputTemplate, setOutputTemplate] = useAtom(outputTemplateAtom);
  /** 月別出力用テンプレート */
  const [monthlyOutputTemplate, setMonthlyOutputTemplate] = useAtom(monthlyOutputTemplateAtom);
  /** タスク区切り文字 */
  const [taskSeparator, setTaskSeparator] = useAtom(taskSeparatorAtom);
  /** タスク時間単位 */
  const [minuteStep, setMinuteStep] = useAtom(minuteStepAtom);
  /** データ保存先パス */
  const storagePath = useAtomValue(storagePathAtom);
  /** データ保存先とファイルを移動 */
  const moveStoragePath = useMoveStoragePathWithFile();
  /** 設定を初期化する */
  const resetPreferences = useResetPreferences();

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
    <ScreenLayout title="アプリケーション設定" padding={false}>
      <div className={styles.body}>
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
            <div className={styles.heading}>日別出力用テンプレート</div>
            <HighlightedTextArea value={outputTemplate} setValue={setOutputTemplate} className={styles.textarea} maxLength={1000}>
              <div className={styles.textareaActions}>
                <ButtonGroup>
                  <TemplateToolButton text="{{year}}">年</TemplateToolButton>
                  <TemplateToolButton text="{{month}}">月</TemplateToolButton>
                  <TemplateToolButton text="{{date}}">日</TemplateToolButton>
                  <TemplateToolButton text="{{weekday}}">曜日</TemplateToolButton>
                </ButtonGroup>
                <ButtonGroup>
                  <TemplateToolButton text="{{startAt}}">開始時刻</TemplateToolButton>
                  <TemplateToolButton text="{{endAt}}">終了時刻</TemplateToolButton>
                </ButtonGroup>
                <TemplateToolButton text="{{total}}h">合計時間</TemplateToolButton>
                <TemplateToolButton text="{{#projects}}\n{{name}} {{description}} {{hours}}h\n{{/projects}}">プロジェクト一覧</TemplateToolButton>
              </div>
            </HighlightedTextArea>
            <div className={styles.description}>
              日別表示コピー時の文章形式。プレースホルダは下部ボタンで挿入可能で、出力時にタスク内容に変換されます。
            </div>
          </label>

          <label className={styles.label}>
            <div className={styles.heading}>月別出力用テンプレート</div>
            <HighlightedTextArea value={monthlyOutputTemplate} setValue={setMonthlyOutputTemplate} className={styles.textarea} maxLength={1000}>
              <div className={styles.textareaActions}>
                <ButtonGroup>
                  <TemplateToolButton text="{{year}}">年</TemplateToolButton>
                  <TemplateToolButton text="{{month}}">月</TemplateToolButton>
                </ButtonGroup>
                <TemplateToolButton text="{{total}}h">合計時間</TemplateToolButton>
                <TemplateToolButton text="{{#projects}}\n{{month}}/{{date}}({{weekday}}) {{name}} {{description}} {{hours}}h\n{{/projects}}">
                  プロジェクト一覧
                </TemplateToolButton>
              </div>
            </HighlightedTextArea>
            <div className={styles.description}>
              月別表示コピー時の文章形式。プレースホルダは下部ボタンで挿入可能で、出力時にタスク内容に変換されます。
            </div>
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
      </div>
    </ScreenLayout>
  );
}

type ButtonProps = {
  children: React.ReactNode;
  text: string;
};

function TemplateToolButton({ children = '', text }: ButtonProps) {
  /** 文字列追加コールバック */
  const insertToHighlightedTextArea = useInsertToHighlightedTextArea();

  /**
   * ボタン押下時の動作
   */
  const handleClick = () => {
    insertToHighlightedTextArea(text.replace(/\\n/g, '\n'));
  };

  return (
    <Button size="small" data-text={text} onClick={handleClick}>
      {children}
    </Button>
  );
}
