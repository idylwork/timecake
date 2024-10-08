type MustacheData = {
  [key: string]: string | number | MustacheData[];
};

/**
 * データに基づいてMustache記法のプレースホルダを置換する
 *
 * @param template
 * @param data 置換用データ (オブジェクト配列はループ構文で展開する)
 * @returns 置換された文字列
 * @example
 * ```
 * replaceMustache('{{ title }}: {{ #items }}{{ name }}{{ /items}}', {
 *   title: 'Example Title',
 *   items: [{ name: 'Item 1' }, { name: 'Item 2' }],
 * })
 * ```
 */
export const replaceMustache = (template: string, data: MustacheData): string => {
  let text = template;

  /**
   * プレースホルダを置換
   * @param text
   * @param data
   * @returns
   */
  const replaceMustacheVars = (text: string, data: MustacheData): string => {
    return text.replace(/\{\{ ?([a-zA-Z]+) ?\}\}/g, (_, attribute) => {
      const value = data[attribute] ?? '';
      return value instanceof Array ? JSON.stringify(value) : `${value}`;
    });
  };

  // ループ構文の置換
  while (true) {
    const loopAttribute = (text.match(/\{\{ ?#([a-zA-Z]+) ?\}\}/) ?? [])[1] ?? null;
    if (!loopAttribute) break;

    const regexp = new RegExp(`\\{\\{ ?#${loopAttribute} ?\\}\\}\\n?([\\s\\S]*?)\\{\\{ ?/${loopAttribute} ?\\}\\}\\n?`);
    text = text.replace(regexp, (_, content) => {
      const childrenData = data[loopAttribute];
      if (!(childrenData instanceof Array)) return '';

      return childrenData
        .map((childData) => {
          return replaceMustacheVars(content, childData);
        })
        .join('');
    });
  }
  return replaceMustacheVars(text, data);
};

/**
 * JSON文字列をパースする
 * @param json
 * @returns JSONをパースした値。。パース失敗時はundefined
 */
export const parseJSON = <T,>(json: string): T | undefined => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error(error);
  }
};
