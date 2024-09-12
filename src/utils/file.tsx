import { createDir, exists, readDir, readTextFile, renameFile, writeTextFile } from '@tauri-apps/api/fs';
import { parseJSON } from './string';

/**
 * ファイル読み込みしてJSONに変換
 * @param path - ファイルパス
 * @returns データが取得できれば配列かオブジェクト、ファイルがない場合は空文字、失敗の場合はundefined
 */
export const readJSONFile = async (path: string): Promise<Array<any> | Object | '' | undefined> => {
  try {
    // ファイルがなければ空文字
    if (!(await exists(path))) {
      return '';
    }

    const text = await readTextFile(path);
    if (text) {
      // ファイル内容があればJSONとしてパース
      return parseJSON(text);
    } else {
      // ファイル内容がなければ空文字
      return '';
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 * JSONに変換してファイル書き込み
 * @param path - ファイルパス
 * @param data - 書き込み内容
 */
export const writeJSONFile = async (path: string, data: any) => {
  try {
    await writeTextFile(path, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
  }
};

/**
 * ディレクトリがなければ新規作成
 * @param path
 */
export const makeDir = async (path: string) => {
  if (!(await exists(path))) {
    createDir(path, { recursive: true });
  }
};

/**
 * ファイル拡張子を取得する
 * @tauri-apps/api/path のものと違い同期実行され、拡張子のないファイル名で例外を発生させない
 * @param fileName
 * @returns 拡張子
 */
export const extname = (fileName: string): string => {
  const chunks = fileName.replace(/^\./, '').split('.');
  return chunks.length < 2 ? '' : chunks.at(-1) ?? '';
};

/**
 * ディレクトリ内のファイルを別ディレクトリに移動
 * @param prevPath
 * @param path
 * @param options.extensions - 対象拡張子リスト (未指定で全拡張子)
 * @returns 成否
 */
export const moveFilesInDir = async (prevPath: string, path: string, { extensions }: { extensions?: string[] }) => {
  if (prevPath === path) return;

  try {
    const entries = await readDir(prevPath);
    // JSONファイルをすべて移動
    for (const entry of entries) {
      if (extensions?.includes(extname(entry.path)) ?? true) {
        await renameFile(`${prevPath}/${entry.name}`, `${path}/${entry.name}`);
      }
    }
    return true;
  } catch (error) {
    // エラー時はストレージ移動も中止
    console.error(error);
    return false;
  }
};
