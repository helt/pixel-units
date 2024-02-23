import { ConvertLengthUnitArgsOptions, LengthUnitSuffix, MultiplicationUnitSuffix, Unit, UnitSuffix } from '@src/defs';
import { getFontSizePixelValue, getViewWidthPixelValue, getViewHeightPixelValue, converterMap } from '@src/internal';

export * from '@src/defs';

const UNIT_SPLIT_REGEXP = /^((?:[1-9]\d*|0)(?:\.\d+)?)(px|cm|mm|Q|in|pc|pt|rem|em|vw|vh|vmin|vmax|%|)$/;
export const splitUnitValue = (value: Unit<UnitSuffix>): { value: number, unitSuffix: UnitSuffix } => {
  const split = value.match(UNIT_SPLIT_REGEXP);
  if (split === null || split.length < 3) {
    throw new TypeError('Invalid value for value argument.');
  }
  return {
    value: parseFloat(split[1]),
    unitSuffix: split[2] as UnitSuffix,
  };
};

const defaultOptions = {
  rem: 16,
  em: 16,
  viewHeight: 1920,
  viewWidth: 1080,
};
export const convertUnits = <
  FromUnitValue extends Unit<UnitSuffix>,
  ToUnitSuffix extends UnitSuffix,
>(
  fromUnitValue: FromUnitValue,
  toUnitSuffix: FromUnitValue extends Unit<LengthUnitSuffix>
    ? LengthUnitSuffix
    : FromUnitValue extends Unit<MultiplicationUnitSuffix>
      ? MultiplicationUnitSuffix
      : never,
  options?: ConvertLengthUnitArgsOptions,
): Unit<ToUnitSuffix> => {
  const { value: fromValue, unitSuffix: fromUnitSuffix } = splitUnitValue(fromUnitValue) ?? {};

  const converters = converterMap[fromUnitSuffix];
  if (converters === undefined) {
    throw new TypeError(`Invalid value ${fromUnitSuffix} for fromUnitValue argument.`);
  }

  const converter = converters[toUnitSuffix];
  if (converter === undefined) {
    throw new TypeError(`Invalid value ${toUnitSuffix} for toUnitSuffix argument, only [${Object.keys(converters).join(",")}] supported for input suffix ${fromUnitSuffix}`);
  }

  const toUnitValue = converter(fromValue, {
    remPixelValue: () => {
      const remPixel = typeof options?.rem === 'string' ? splitUnitValue(options?.rem) : undefined;
      const remElement = typeof options?.rem === 'object' ? options?.rem : undefined;
      const remPixelValue = remPixel ? remPixel.value : getFontSizePixelValue(remElement);
      return remPixelValue ?? defaultOptions.rem;
    },
    emPixelValue: () => {
      const emPixel = typeof options?.em === 'string' ? splitUnitValue(options?.em) : undefined;
      const emElement = typeof options?.em === 'object' ? options?.em : undefined;
      const emPixelValue = emPixel ? emPixel.value : getFontSizePixelValue(emElement);
      return emPixelValue ?? defaultOptions.em;
    },
    viewWidthPixelValue: () => {
      const viewWidthPixelValue = options?.viewWidth ?? getViewWidthPixelValue();
      return viewWidthPixelValue ?? defaultOptions.viewWidth;
    },
    viewHeightPixelValue: () => {
      const viewHeightPixelValue = options?.viewHeight ?? getViewHeightPixelValue();
      return viewHeightPixelValue ?? defaultOptions.viewHeight;
    },
  });
  return `${toUnitValue}${toUnitSuffix}` as unknown as Unit<ToUnitSuffix>;
};

/**
 * Type guard to narrow down a string value to a `Unit<UnitSuffix>`
 * @param value
 */
export function isUnitValue(value: string): value is Unit<UnitSuffix> {
  const split = value.match(UNIT_SPLIT_REGEXP)
  if (split === null || split.length < 3) {
    return false
  }
  return true;
}


/**
 * takes a string and tries to infer the actual pixel value on the screen.
 * @param cssLength
 * @param elem
 * @param dir
 * @throws TypeError if cssLength is not a valid
 */
export function normalizeToPixel(cssLength: string, elem?: HTMLElement, dir: 'w' | 'h' = 'w') {
  if(!isUnitValue(cssLength)) {
    return Number.NaN;
  }

  const maxHeightSPlit = splitUnitValue(cssLength)

  switch (maxHeightSPlit.unitSuffix) {
    case '':
    case 'px':
      return maxHeightSPlit.value
    case '%':
      if (!elem) {
        return 0
      }
      if (dir === 'w') {
        return (maxHeightSPlit.value * (elem.parentElement?.clientHeight ?? 0)) / 100
      } else {
        return (maxHeightSPlit.value * (elem.parentElement?.clientHeight ?? 0)) / 100
      }
    case 'pt':
    case 'cm':
    case 'em':
    case 'in':
    case 'mm':
    case 'pc':
    case 'Q':
    case 'rem':
    case 'vh':
    case 'vmax':
    case 'vmin':
    case 'vw':
      const pxValue = convertUnits(cssLength, 'px')
      const split = splitUnitValue(pxValue)
      return split.value
  }

}
