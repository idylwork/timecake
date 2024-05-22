import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.css';

type Props = {
  value: string;
  setValue: (newValue: string) => void;
  className?: string;
};

/** 検索モード */
const HighlightType = {
  // 装飾なし
  Plain: 'highlightPlain',
  // コード
  Variable: 'highlightVariable',
  // コードブロック
  SectionStart: 'highlightSectionStart',
  // 検索文字列
  SectionEnd: 'highlightSectionEnd',
  // 非表示
  None: 'highlightNone',
} as const
type HighlightType = (typeof HighlightType)[keyof typeof HighlightType]

/** ハイライト情報 */
type HighlightDelta = {
  type: HighlightType,
  text: string;
}

/**
 * 入力補助機能を備えたテキストエリア
 * @param value - 入力内容
 * @param setValue - 入力変更時の処理
 * @returns
 */
export default React.memo(React.forwardRef<HTMLTextAreaElement, Props>(({ value, setValue, className = '' }, ref) => {
  /** ハイライト要素の参照 */
  const highlightRef = useRef<HTMLDivElement>(null)
  /** @var テキストエリア要素の高さ */
  const [textAreaHeight, setTextAreaHeight] = useState(0)

  // テキストエリアの高さをシンタックスハイライトの高さと同期する
  useEffect(() => {
    setTimeout(() => {
      setTextAreaHeight(highlightRef.current?.clientHeight ?? 0)
    }, 0)
  }, [value])

    /**
   * 文章入力時
   * @param event
   */
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.currentTarget.value)
  }

  /** ハイライト要素リスト */
  const highlightDeltas = useMemo<HighlightDelta[]>(() => {
    const deltas: HighlightDelta[] = []

    const lines = value.split('\n')
    let currentLine = -1

    while (currentLine + 1 < lines.length) {
      currentLine += 1
      let line = lines[currentLine]

      while (true) {
        let old = line
        line = line.replace(/^([\s\S]*?){{( ?[^\}]* ?)}}/, (_, prefix, attribute) => {
          deltas.push({
            type: HighlightType.Plain,
            text: `${prefix}`,
          });

          switch (attribute.at(0)) {
            case '#':
              deltas.push({
                type: HighlightType.SectionStart,
                text: attribute.substring(1),
              });
              break;
            case '/':
              deltas.push({
                type: HighlightType.SectionEnd,
                text: attribute.substring(1),
              });
              break;
            default:
              deltas.push({
                type: HighlightType.Variable,
                text: attribute,
              });
              break;
          }

          return '';
        });

        if (line === old) {
          deltas.push({
            type: HighlightType.Plain,
            text: `${line}\n`,
          })
          break
        }
      }
    }

    return deltas
  }, [value])

  return (
    <div className={classNames(styles.root, className)}>
      <textarea
        ref={ref}
        className={styles.textarea}
        style={{ height: `${textAreaHeight}px` }}
        value={value}
        autoCapitalize="off"
        onChange={handleChange}
      />
      <div ref={highlightRef} className={styles.highlight}>
        {highlightDeltas.map((delta, index) => <EditorTextDelta type={delta.type} text={delta.text} indent={delta.indent} key={index} />)}
      </div>
    </div>
  )
}))

/**
 * 装飾されたテキスト
 * @param props.delta - テキストと装飾情報
 * @returns
 */
const EditorTextDelta = React.memo((delta: HighlightDelta) => {
  switch (delta.type) {
    case HighlightType.Variable: return (
      <span className={classNames(styles.highlightBox, styles[delta.type])}>
        <span className={styles.tag}>{'{{'}</span>{delta.text}<span className={styles.tag}>{'}}'}</span>
      </span>
    )
    case HighlightType.SectionStart: return (
      <span className={classNames(styles.highlightBox, styles[delta.type])}>
        <span className={styles.tag}>{'{{#'}</span>{delta.text}<span className={styles.tag}>{'}}'}</span>
      </span>
    )
    case HighlightType.SectionEnd: return (
      <span className={classNames(styles.highlightBox, styles[delta.type])}>
        <span className={styles.tag}>{'{{/'}</span>{delta.text}<span className={styles.tag}>{'}}'}</span>
      </span>
    )
    case HighlightType.None:
    case HighlightType.Plain: return (
      <span className={classNames(styles.highlightRow, styles[delta.type])}>
        {delta.text}
      </span>
    )
  }
})
