import { useAtom, useSetAtom } from 'jotai';
import ScreenLayout, { ScreenActions } from '../ScreenLayout';
import styles from './index.module.css';
import { ScreenMode, displayModeAtom, outputTemplateAtom } from '../../atoms/dateTaskState';
import { CheckIcon } from '@radix-ui/react-icons';
import Button from '../Button';

export default function PreferenceScreen() {
  /** 画面表示モード */
  const setDisplayingMode = useSetAtom(displayModeAtom);
  /** 出力用テンプレート */
  const [outputTemplate, setOutputTemplate] = useAtom(outputTemplateAtom);

  /**
   * 出力用テンプレート変更時の処理
   * @param event 
   */
  const handleOutputTemplateChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOutputTemplate(event.currentTarget.value);
  };

  return (
    <ScreenLayout title="アプリケーション設定">
      <div className={styles.heading}>出力用テンプレート</div>
      <textarea className={styles.textarea} value={outputTemplate} onChange={handleOutputTemplateChange} />
      <ScreenActions>
        <Button size="large" className={styles.ok} icon={<CheckIcon />} onClick={() => setDisplayingMode(ScreenMode.taskEditor)}>OK</Button>      
      </ScreenActions>
    </ScreenLayout>
  );
}
