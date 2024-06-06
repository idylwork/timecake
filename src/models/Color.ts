export default class Color {
  /** 赤 */
  red: number;
  /** 碧 */
  green: number;
  /** 青 */
  blue: number;
  /** 明るさ */
  #brightness: number | null = null;
  /** 彩度 */
  #saturation: number | null = null;

  constructor(colorOrRed: Color | number | string, green: number | null = null, blue: number | null = null) {
    if (typeof colorOrRed === 'object') {
      this.red = colorOrRed.red;
      this.green = colorOrRed.green;
      this.blue = colorOrRed.blue;
    } else if (green !== null && blue !== null) {
      this.red = Number(colorOrRed);
      this.green = green;
      this.blue = blue;
    } else {
      // 引数が1つの場合はカラーコード文字列として扱う
      const code = String(colorOrRed).replace(/^#/, '');
      const chunks = [];
      const chunkLength = Math.floor(code.length / 3);
      for (let i = 0; i < code.length; i += chunkLength) {
        chunks.push(code.slice(i, i + chunkLength));
      }
      this.red = parseInt(chunks[0], 16);
      this.green = parseInt(chunks[1], 16);
      this.blue = parseInt(chunks[2], 16);
    }
  }

  /** 明るさを取得 */
  get brightness() {
    if (this.#brightness === null) {
      this.#brightness = Math.max(this.red, this.green, this.blue * 0.5);
    }
    return this.#brightness;
  }

  /** 彩度を取得 */
  get saturation() {
    if (this.#brightness === null) {
      const max = this.brightness;
      const min = Math.min(this.red, this.green, this.blue);
      const diff = max - min;
      this.#saturation = this.#brightness == 0 ? 0 : diff / max;
    }
    return this.#saturation;
  }

  /** 色彩を取得 */
  get hue() {
    const max = this.brightness;
    const min = Math.min(this.red, this.green, this.blue);
    const diff = max - min;

    switch (min) {
      case max:
        return 0;
      case this.red:
        return 60 * ((this.blue - this.green) / diff) + 180;
      case this.green:
        return 60 * ((this.red - this.blue) / diff) + 300;
      case this.blue:
        return 60 * ((this.green - this.red) / diff) + 60;
    }
  }

  get isDark() {
    return this.brightness < 200;
  }

  toString() {
    return `#${this.red.toString(16).padStart(2, '0')}${this.green.toString(16).padStart(2, '0')}${this.blue.toString(16).padStart(2, '0')}`;
  }
}
