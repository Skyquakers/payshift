import { ChargeCreateParams, IPaymentProvidable, PayshiftProviderName } from "../common"
import axios from "axios"
import { createHash } from "crypto"


interface FakaPaymentResult {
  url: string
}


export class FakaProvider implements IPaymentProvidable {
  public name: PayshiftProviderName = 'order2faka'
  public key: string
  public endpoint: string
  public merchantId: string

  constructor (merchantId: string, key: string, endpoint: string) {
    this.key = key
    this.endpoint = endpoint
    this.merchantId = merchantId
  }

  async createPayment (params: ChargeCreateParams, notifyUrl?: string): Promise<FakaPaymentResult> {
    const url = new URL('/api/orders', this.endpoint).toString()
    const res = await axios.post(url, {
      title: params.title,
      amount: params.amount,
      outTradeNo: params.outTradeNo,
      returnUrl: params.returnUrl,
      description: params.description,
      clientIp: params.clientIp,
      userAgent: params.userAgent,
      merchantId: this.merchantId,
      merchantKeyHash: createHash('md5').update(`${params.outTradeNo}${this.key}`).digest('hex'),
      notifyUrl,
      currency: params.currency,
    })

    return {
      url: res.data.url
    }
  }
}