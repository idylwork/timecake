import { useEffect, useRef } from 'react';

/**
 * 初期化時に実行せず、値の更新時のみ実行するuseEffect
 * @param effect
 * @param deps
 */
export default function useUpdateEffect(effect: React.EffectCallback, deps: React.DependencyList) {
  /** コンポーネント初期化済みか */
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      return effect();
    } else {
      isInitialized.current = true;
    }
  }, deps);
}
