import type { ChargeCreateParams, IPaymentProvidable, PayshiftProviderName } from '../common'
import axios, { AxiosResponse } from 'axios'
import { createHash } from 'crypto'

interface EPayPaymentResult {
  code: number
  msg: string
  trade_no: string
  payurl?: string
  qrcode?: string
  urlscheme?: string
}

export type EPayType = 'alipay' | 'wxpay' | 'qqpay' | 'bank' | 'jdpay' | 'paypal'

type EPayDevice = 'pc' | 'mobile' | 'qq' | 'wechat' | 'alipay'

interface EPayPaymentParams {
  pid: number,
  out_trade_no: string,
  notify_url: string,
  return_url?: string,
  name: string,
  money: string,
  clientip: string,
  device: EPayDevice,
  param?: string,
  sign: string,
  sign_type: 'MD5',
  type: EPayType,
}

type PresignedEPayPaymentParams = Omit<EPayPaymentParams, 'sign'>

export interface EPayMetaParams {
  notify_url: string
  clientip: string
}

let cachedKey: string = ''

export const sign = function(data: PresignedEPayPaymentParams, key?: string): string {
  const keys: (keyof PresignedEPayPaymentParams)[] = []
  const pairs: [keyof PresignedEPayPaymentParams, string][] = []

  if (key) {
    cachedKey = key    
  }

  for (const key of Object.keys(data) as (keyof PresignedEPayPaymentParams)[]) {
    keys.push(key)
  }

  for (const key of keys.sort()) { 
    pairs.push([key, String(data[key])])
  }

  const params = new URLSearchParams(pairs)

  return createHash('md5').update(`${params.toString()}${cachedKey}`).digest('hex')
}


export class EPayProvider implements IPaymentProvidable {
  public name: PayshiftProviderName = 'epay'
  private pid: number
  private key: string
  private endpoint: string
  private notifyUrl?: string

  constructor (endpoint: string, pid: number, key: string, notifyUrl?: string) {
    this.pid = pid
    this.notifyUrl = notifyUrl
    this.key = key
    this.endpoint = endpoint
  }
  

  public async createPayment (
    charge: ChargeCreateParams,
    notifyUrl?: string): Promise<Pick<EPayPaymentResult, 'payurl' | 'qrcode' | 'urlscheme'>> {
    const type: EPayType = charge.channel === 'epay_alipay' ? 'alipay' : 'wxpay'

    const notify_url = notifyUrl ?? this.notifyUrl ?? ''

    const data: Omit<EPayPaymentParams, 'sign'> = {
      pid: this.pid,
      out_trade_no: charge.outTradeNo,
      notify_url,
      name: charge.title,
      money: (charge.amount / 100).toFixed(2),
      clientip: charge.clientIp,
      device: 'pc',
      sign_type: 'MD5',
      type,
      param: JSON.stringify({
        notify_url,
        clientip: charge.clientIp
      })
    }

    const finalData = {
      ...data,
      sign: sign(data, this.key)
    }

    console.log(finalData)

    const res = await axios.post<EPayPaymentParams, AxiosResponse<EPayPaymentResult>>(
      `${this.endpoint}/mapi.php`,
      finalData
    )

    if (res.data.code !== 1) {
      throw new Error(res.data.msg)
    }

    return {
      urlscheme: res.data.urlscheme,
      payurl: res.data.payurl,
      qrcode: res.data.qrcode
    }
  }
}
