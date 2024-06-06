import { useEffect, useState } from 'react';

interface Props {
  onDragStart?: (y: number) => void;
  onDragging: (y: number) => void;
  onDragEnd: (y: number) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * 縦方向のドラッグを検知するエリア
 * @param props.onDragging - ドラッグ中の処理
 * @param props.onDragEnd - ドラッグ終了時の処理
 * @returns
 */
export default function VerticalDraggableArea({ onDragStart, onDragging, onDragEnd, ...props }: Props) {
  /** ドラッグ開始Y座標 (nullで非ドラッグ中) */
  const [dragStartingY, setDragStartingY] = useState<number | null>(null);

  /**
   * ドラッグ開始時の処理
   * @param event
   */
  const handleDragStart = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    switch (target.tagName) {
      case 'INPUT':
      case 'SELECT':
        // 入力フォームはドラッグ対象外とする
        return;
      default:
        event.stopPropagation();
        if (onDragStart) {
          onDragStart(event.screenY);
        }
        setDragStartingY(event.screenY);
    }
  };

  useEffect(() => {
    if (dragStartingY === null) return;

    /**
     * ドラッグ中の処理
     * @param event
     */
    const handleDrag = (event: MouseEvent) => {
      event.preventDefault();
      onDragging(dragStartingY - event.screenY);
    };

    /**
     * ドラッグ終了時の処理
     * @param event
     */
    const handleDragEnd = (event: MouseEvent) => {
      setDragStartingY(null);
      onDragEnd(dragStartingY - event.screenY);
    };

    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd, { once: true });
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [dragStartingY]);

  return <div {...props} onMouseDown={handleDragStart} />;
}
