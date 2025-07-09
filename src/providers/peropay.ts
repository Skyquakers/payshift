import { IPaymentProvidable, PayshiftProviderName } from '../common'

interface PeropayOrderDTO {
  usdcents: number
  notifyUrl: string
  payerAddress: string
  recipientAddress: string
}

export interface PeropayOrder {
  id: string
  usdcents: number
  peroAmount: bigint
  payerAddress: `0x${string}`
  notifyUrl: string
  status: 'pending' | 'paid' | 'expired'
  createdAt: Date
  updatedAt: Date
  orderWalletAddress?: `0x${string}`
  recipientAddress: `0x${string}`
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

  async createOrder(
    payerAddress: string,
    recipientAddress: string,
    usdcents: number,
    notifyUrl: string
  ) {
    const url = new URL('/orders', this.endpoint).toString()
    const order: PeropayOrderDTO = {
      usdcents,
      notifyUrl: notifyUrl,
      payerAddress: payerAddress,
      recipientAddress: recipientAddress,
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    })

    if (!res.ok) {
      throw new Error('Failed to create order')
    }

    const data: PeropayOrder = await res.json()
    return data
  }
}
