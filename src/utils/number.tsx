/**
 * 数値単位で切り捨てする
 * @param number
 * @param unit
 * @returns
 */
export const floorNumberUnit = (number: number, unit: number) => {
  return Math.floor(number / unit) * unit;
};
