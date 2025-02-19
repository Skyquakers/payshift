import {
  ChargeCreateParams,
  IPaymentProvidable,
  PayshiftProviderName,
} from '../common'

interface NgeniusCreateOrderParams {
  action: 'SALE' | 'AUTH' | 'PURCHASE'
  amount: {
    currencyCode: string
    value: number
  }
  emailAddress?: string
  billingAddress?: {
    firstName: string
    lastName: string
  }
}

interface NgeniusOrderResponse {
  _id: string
  _links: {
    'cnp:payment-link'?: {
      href: string
    }
    'payment-authorization'?: {
      href: string
    }
    self: {
      href: string
    }
    'tenant-brand'?: {
      href: string
    }
    payment?: {
      href: string
    }
    'merchant-brand'?: {
      href: string
    }
  }
  action: 'SALE' | 'AUTH' | 'PURCHASE'
  amount: {
    currencyCode: string
    value: number
  }
  language?: string
  merchantAttributes?: {
    redirectUrl: string
  }
  emailAddress?: string
  reference: string
  outletId: string
  createDateTime: string
  paymentMethods?: {
    card?: string[]
    wallet?: string[]
  }
  referrer?: string
  formattedAmount?: string
  formattedOrderSummary?: Record<string, unknown>
  _embedded?: {
    payment?: Array<{
      _id: string
      _links: {
        'payment:apple_pay'?: { href: string }
        self: { href: string }
        'payment:card'?: { href: string }
        'payment:samsung_pay'?: { href: string }
        'payment:saved-card'?: { href: string }
        curies?: Array<{
          name: string
          href: string
          templated: boolean
        }>
      }
      state: string
      amount: {
        currencyCode: string
        value: number
      }
      updateDateTime: string
      outletId: string
      orderReference: string
    }>
  }
}

interface NgeniusSubmitCardParams {
  pan: string
  expiry: string
  cvv: string
  cardHolderName: string
}

interface NgeniusSubmitCardResponse {
  _id: string
  _links: {
    self: { href: string }
    curies?: Array<{
      name: string
      href: string
      templated: boolean
    }>
  }
  paymentMethod: {
    expiry: string
    cardholderName: string
    name: string
    pan: string
    cvv: string
  }
  outletId: string
  orderReference: string
  state: string
  amount: {
    currencyCode: string
    value: number
  }
  updateDateTime: string
  authResponse?: {
    authorizationCode: string
    success: boolean
  }
}

export class NgeniusProvider implements IPaymentProvidable {
  public name: PayshiftProviderName = 'ngenius'
  public apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  getAPIHost(testOnly = false): string {
    if (process.env.NODE_ENV !== 'production' || testOnly) {
      return 'https://api-gateway.sandbox.ngenius-payments.com'
    }
    return 'https://api-gateway.ngenius-payments.com'
  }

  async getAccessToken(testOnly = false): Promise<string> {
    try {
      const url = new URL(
        '/identity/auth/access-token',
        this.getAPIHost(testOnly)
      )
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.ni-identity.v1+json',
          Authorization: `Basic ${this.apiKey}`,
        },
      })

      if (!res.ok) {
        const data = await res.json()
        console.error(data)
        throw new Error('Failed to get access token')
      }

      const data = await res.json()
      return data.access_token
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async createOrder(
    outletId: string,
    params: NgeniusCreateOrderParams,
    testOnly = false
  ): Promise<NgeniusOrderResponse> {
    try {
      const accessToken = await this.getAccessToken(testOnly)
      const url = new URL(
        `/transactions/outlets/${outletId}/orders`,
        this.getAPIHost(testOnly)
      )
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.ni-payment.v2+json',
          Accept: 'application/vnd.ni-payment.v2+json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(params),
      })
      if (!res.ok) {
        const data = await res.json()
        throw data
      }

      const data = await res.json()
      return data
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async submitCard(
    outletId: string,
    orderReference: string,
    paymentReference: string,
    params: NgeniusSubmitCardParams,
    testOnly = false
  ): Promise<NgeniusSubmitCardResponse> {
    try {
      const accessToken = await this.getAccessToken(testOnly)
      const url = new URL(
        `/transactions/outlets/${outletId}/orders/${orderReference}/payments/${paymentReference}/card`,
        this.getAPIHost(testOnly)
      )
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/vnd.ni-payment.v2+json',
          Accept: 'application/vnd.ni-payment.v2+json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(params),
      })
      if (!res.ok) {
        const data = await res.json()
        throw data
      }

      const data = await res.json()
      return data
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async createPayment(
    params: ChargeCreateParams,
    sessionId: string,
    outletId: string,
    testOnly = false
  ): Promise<{ data: any }> {
    try {
      const accessToken = await this.getAccessToken(testOnly)
      const url = new URL(
        `/transactions/outlets/${outletId}/payment/hosted-session/${sessionId}`,
        this.getAPIHost(testOnly)
      )
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.ni-payment.v2+json',
          Accept: 'application/vnd.ni-payment.v2+json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'SALE',
          amount: {
            value: params.amount,
            currency: params.currency,
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        console.error(data)
        throw new Error('Failed to complete payment')
      }

      const data = await res.json()

      return {
        data,
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}
