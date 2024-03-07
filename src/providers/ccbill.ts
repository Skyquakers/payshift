import type { ChargeCreateParams, IPaymentProvidable, PayshiftProviderName } from "../common"
import { CurrencyCode } from "../currency"
import { createHash } from "crypto"
import { convertCurrencyCodeToNumber } from "../utils"


export class CCBillProvider implements IPaymentProvidable {
  public name: PayshiftProviderName = 'ccbill'
  private subAccountId: string
  public salt: string
  private flexId: string

  constructor (subAccountId: string, salt: string, flexId: string) {
    this.subAccountId = subAccountId
    this.salt = salt
    this.flexId = flexId
  }

  private getAPIHost (): string {
    if (process.env.NODE_ENV === 'production') {
      return 'https://api.ccbill.com'
    } else {
      return 'https://sandbox-api.ccbill.com/'
    }
  }

  private generateDigest (initialPrice: string, initialPeriod: string, currencyCode: number, salt: string): string {
    return createHash('md5').update(`${initialPrice}${initialPeriod}${currencyCode}${salt}`).digest('hex')
  }

  public createDesktopPaymentLink (charge: ChargeCreateParams): string {
    const url = new URL(this.getAPIHost())
    url.pathname = `/wap-frontflex/flexforms/${this.flexId}`
    url.searchParams.append('clientSubacc', this.subAccountId)
    const value = charge.currency === CurrencyCode.JPY ? `${String(charge.amount)}.00` : (charge.amount / 100).toFixed(2)
    url.searchParams.append('initialPrice', value)
    url.searchParams.append('initialPeriod', '30')

    const currencyNumber = convertCurrencyCodeToNumber(charge.currency)
    if (currencyNumber === null) {
      throw new Error('Unsupported currency')
    }

    url.searchParams.append('currencyCode', String(currencyNumber))
    const digest = this.generateDigest(
      url.searchParams.get('initialPrice') as string,
      url.searchParams.get('initialPeriod') as string,
      currencyNumber,
      this.salt
    )
    url.searchParams.append('formDigest', digest)
    url.searchParams.append('outTradeNo', charge.outTradeNo)
    url.searchParams.append('title', charge.title)

    return url.toString()
  }
} 