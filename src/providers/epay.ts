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

type EPayType = 'alipay' | 'wxpay' | 'qqpay' | 'bank' | 'jdpay' | 'paypal'

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


export const sign = function(data: PresignedEPayPaymentParams, key: string): EPayPaymentParams {
  const keys: (keyof PresignedEPayPaymentParams)[] = []
  const pairs: [keyof PresignedEPayPaymentParams, string][] = []

  for (const key of Object.keys(data) as (keyof PresignedEPayPaymentParams)[]) {
    keys.push(key)
  }

  for (const key of keys.sort()) { 
    pairs.push([key, String(data[key])])
  }

  const params = new URLSearchParams(pairs)
  const sign = createHash('md5').update(`${params.toString()}${key}`).digest('hex')
  const signedData = {
    ...data,
    sign
  }

  return signedData
}


export class EPayProvider implements IPaymentProvidable {
  public name: PayshiftProviderName = 'epay'
  private pid: number
  private key: string
  private notifyUrl?: string

  constructor (pid: number, key: string, notifyUrl?: string) {
    this.pid = pid
    this.notifyUrl = notifyUrl
    this.key = key
  }
  

  public async createPayment (
    charge: ChargeCreateParams,
    notifyUrl?: string): Promise<Pick<EPayPaymentResult, 'payurl' | 'qrcode' | 'urlscheme'>> {
    const type: EPayType = charge.channel === 'epay_alipay' ? 'alipay' : 'wxpay'

    const data: Omit<EPayPaymentParams, 'sign'> = {
      pid: this.pid,
      out_trade_no: charge.outTradeNo,
      notify_url: notifyUrl ?? this.notifyUrl ?? '',
      name: charge.title,
      money: (charge.amount / 100).toFixed(2),
      clientip: charge.clientIp,
      device: 'pc',
      sign_type: 'MD5',
      type,
    }

    const res = await axios.post<EPayPaymentParams, AxiosResponse<EPayPaymentResult>>(
      'http://epay.com/mapi.php',
      sign(data, this.key)
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
