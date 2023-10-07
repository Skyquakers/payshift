import type { ChargeCreateParams, IPaymentProvidable, PayshiftProviderName } from '../common'
import axios, { AxiosResponse } from 'axios'
import { createHash } from 'crypto'

export interface EPayPaymentResult {
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
  type: EPayType,
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
}

type PresignedEPayPaymentParams = Omit<EPayPaymentParams, 'sign'>

export interface EPayMetaParams {
  notify_url: string
  clientip: string
}

export const sign = function(data: PresignedEPayPaymentParams, epayKey: string): string {
  const keys: (keyof PresignedEPayPaymentParams)[] = []
  let phrase: string = ''

  for (const key of Object.keys(data) as (keyof PresignedEPayPaymentParams)[]) {
    if (key !== 'sign_type' && data[key]) {
      keys.push(key)      
    }
  }

  for (const [index, key] of keys.sort().entries()) { 
    phrase += `${key}=${data[key]}`
    if (index !== keys.length - 1) {
      phrase += '&'
    }
  }

  phrase += epayKey

  return createHash('md5').update(phrase).digest('hex')
}


export class EPayProvider implements IPaymentProvidable {
  public name: PayshiftProviderName = 'epay'
  public pid: number
  public key: string
  public endpoint: string
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
    let type: EPayType | undefined = undefined

    if (charge.channel === 'epay_alipay' || charge.channel === 'epay_cluster_alipay') {
      type = 'alipay'
    } else {
      type = 'wxpay'
    }

    const notify_url = notifyUrl ?? this.notifyUrl ?? 'http://taobao.com'

    const data: PresignedEPayPaymentParams = {
      pid: this.pid,
      out_trade_no: charge.outTradeNo,
      notify_url,
      return_url: charge.returnUrl,
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

    const finalData: EPayPaymentParams = {
      ...data,
      sign: sign(data, this.key)
    }

    const url = new URL('/mapi.php', this.endpoint)

    const unullableData: Record<string, string> = Object.entries(finalData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value)
      }
      return acc
    }, {} as Record<string, string>)

    const formString = new URLSearchParams(unullableData).toString()

    const res = await axios.post<EPayPaymentParams, AxiosResponse<EPayPaymentResult>>(
      url.toString(),
      formString
    )

    if (res.data.code !== 1) {
      if (res.data.msg) {
        throw new Error(res.data.msg)
      }
      throw new Error(JSON.stringify(res.data))
    }

    const result: Pick<EPayPaymentResult, 'payurl' | 'qrcode' | 'urlscheme'> = {}

    if (res.data.urlscheme) {
      result.urlscheme = res.data.urlscheme
    }

    if (res.data.payurl) {
      result.payurl = res.data.payurl
    }

    if (res.data.qrcode) {
      result.qrcode = res.data.qrcode
    }

    return result
  }
}
