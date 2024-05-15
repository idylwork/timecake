import Color from './Color';

export interface ProjectData {
  id?: string;
  name: string;
  color: Color | string;
  isAvailable?: boolean;
}

/**
 * プロジェクトモデル
 */
export default class Project {
  /** ID */
  id?: string;
  /** プロジェクト名 */
  name: string;
  /** プロジェクト固有色 */
  color: Color;
  /** 選択できるか */
  isAvailable: boolean;

  constructor({ id = crypto.randomUUID(), name, color, isAvailable = true }: ProjectData) {
    this.id = id;
    this.name = name;
    this.color = new Color(color);
    this.isAvailable = isAvailable;
  }

  toObject() {
    return {
      ...this,
      color: this.color.toString(),
    };
  }
}
