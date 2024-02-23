import { UnitSuffix } from '@src/defs';

import { noConvert } from '@src/internal'

const magnificationToPercent = (value: number): number => {
  return value * 100;
};

export const magnification = {
  [UnitSuffix.Percent]: magnificationToPercent,
  [UnitSuffix.Magnification]: noConvert,
};
