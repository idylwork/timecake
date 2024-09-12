import { useEffect, useRef } from 'react';

interface Options {
  delay?: number;
  onStart?: () => void;
}

/**
 * 時間差で副作用フックを実行する
 * 連続で変更があった場合は古い変更の副作用をキャンセルし、更新が落ち着いてから処理を実行できる
 * @param effect 値の操作が終了してしばらく待ってから実行されるコールバック
 * @param deps 依存する変数
 * @param options.onStart 連続して更新があったときに最初の1回だけ実行するコールバック
 * @param options.delay useDelayEffectの発火猶予 (ミリ秒)
 */
const useDelayEffect = (effect: () => void, deps: React.DependencyList, { delay = 1000, onStart }: Options = {}) => {
  /** @var {boolean} 値の変更直後か */
  const isPendingRef = useRef(false);
  /** @var {number|undefined} 延期中のタイムアウトID */
  const timeoutIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    isPendingRef.current = true;

    // 連続でステートを変更した場合の最初の変更時
    if (!timeoutIdRef.current && onStart) {
      onStart();
    }

    // 連続でステートを変更した場合は前の副作用をキャンセル
    if (timeoutIdRef) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = undefined;
    }
    if (isPendingRef.current) {
      const newTimeoutId: number = window.setTimeout(() => {
        isPendingRef.current = false;
        timeoutIdRef.current = undefined;

        // 一定時間タイムアウトIDの更新がなければ実行
        effect();
      }, delay);
      timeoutIdRef.current = newTimeoutId;
    }

    return () => {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = undefined;
    };
  }, deps);
};

export default useDelayEffect;
