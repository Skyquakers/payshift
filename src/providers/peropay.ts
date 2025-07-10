import {
  ChargeCreateParams,
  IPaymentProvidable,
  PayshiftProviderName,
} from '../common'
import { CurrencyCode } from '../currency'

interface PeropayOrderDTO {
  usdcents: number
  notifyUrl: string
  recipientAddress: `0x${string}`
  outTradeNo: string
}

export interface PeropayOrder {
  id: string
  usdcents: number
  peroAmount: bigint
  notifyUrl: string
  status: 'pending' | 'paid' | 'expired'
  createdAt: Date
  updatedAt: Date
  orderWalletAddress?: `0x${string}`
  recipientAddress: `0x${string}`
  outTradeNo: string
}

interface PeropayQuote {
  usdcents: number
  priceUsd: number
  peroAmount: number
}

export class PeropayProvider implements IPaymentProvidable {
  public name: PayshiftProviderName = 'peropay'
  public endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  async getQuote(usdcents: number) {
    const url = new URL('/quote', this.endpoint)
    url.searchParams.set('usdcents', usdcents.toString())
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error('Failed to get quote')
    }

    const data: PeropayQuote = await res.json()
    return data
  }

  async getOrder(id: string) {
    const url = new URL(`/orders/${id}`, this.endpoint)
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error('Failed to get order')
    }

    const data: PeropayOrder = await res.json()
    return data
  }

  public async createPayment(params: ChargeCreateParams, notifyUrl: string) {
    if (params.currency !== CurrencyCode.USD) {
      throw new Error('Peropay only supports USD')
    }

    if (!params.recipientAddress) {
      throw new Error('Recipient address is required')
    }

    const order = await this.createOrder({
      recipientAddress: params.recipientAddress,
      usdcents: params.amount,
      notifyUrl,
      outTradeNo: params.outTradeNo,
    })

    return order
  }

  private async createOrder({
    recipientAddress,
    usdcents,
    notifyUrl,
    outTradeNo,
  }: {
    recipientAddress: `0x${string}`
    usdcents: number
    notifyUrl: string
    outTradeNo: string
  }) {
    const url = new URL('/orders', this.endpoint).toString()
    const order: PeropayOrderDTO = {
      usdcents,
      notifyUrl: notifyUrl,
      recipientAddress: recipientAddress,
      outTradeNo,
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message)
    }

    const data: PeropayOrder = await res.json()
    return data
  }
}
