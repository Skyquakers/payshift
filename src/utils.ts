import { CurrencyCode } from "./currency"

const currencyCodeNumberMap = {
  [CurrencyCode.JPY]: 392,
  [CurrencyCode.USD]: 840,
  [CurrencyCode.EUR]: 978,
  [CurrencyCode.GBP]: 826,
  [CurrencyCode.AUD]: 36,
  [CurrencyCode.CAD]: 124,
  124: CurrencyCode.CAD,
  392: CurrencyCode.JPY,
  840: CurrencyCode.USD,
  978: CurrencyCode.EUR,
  826: CurrencyCode.GBP,
  36: CurrencyCode.AUD,
}


export const convertCurrencyCodeToNumber = (currency: CurrencyCode): number | null => {
  const result = currencyCodeNumberMap[currency as keyof typeof currencyCodeNumberMap]
  if (typeof result === 'string') {
    return null
  }

  return result
}


export const converNumberToCurrencyCode = (currencyNumber: number): CurrencyCode | undefined => {
  const result = currencyCodeNumberMap[currencyNumber as keyof typeof currencyCodeNumberMap]
  if (typeof result === 'number') {
    return undefined
  }

  return result
}