import { Unit, UnitSuffix } from '@src/defs'

export const noConvert = (unitValue: Unit<UnitSuffix>): Unit<UnitSuffix> => {
  return unitValue
}