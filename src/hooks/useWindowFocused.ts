import { appWindow } from '@tauri-apps/api/window';
import { useEffect, useState } from 'react';

/**
 * アプリケーションのウィンドウがフォーカスを検知
 * @returns アプリケーションがフォーカスされているか
 */
export default function useWindowFocused() {
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    const unlisten = appWindow.onFocusChanged(({ payload: focused }) => {
      setIsFocused(focused);
    });
    return () => {
      (async () => {
        (await unlisten)();
      })();
    };
  }, []);

  return isFocused;
}
