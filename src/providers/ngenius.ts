import {
  ChargeCreateParams,
  IPaymentProvidable,
  PayshiftProviderName,
} from '../common'

interface NgeniusCreateOrderAmount {
  currencyCode: string
  value: number
}

type NgeniusCreateOrderAction = 'SALE' | 'AUTH' | 'PURCHASE'

interface NgeniusCreateOrderParams {
  action: NgeniusCreateOrderAction
  amount: NgeniusCreateOrderAmount
  emailAddress?: string
  billingAddress?: {
    firstName: string
    lastName: string
  }
}

type NgeniusPaymentState =
  | 'STARTED'
  | 'AUTHORISED'
  | 'PURCHASED'
  | 'CAPTURED'
  | 'AWAIT_3DS'
  | 'FAILED'

interface NgeniusOrder {
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
      _id: string // urn:payment:payment-reference, eg: urn:payment:2fff837f-9a39-4a02-8435-9aaa7cb6b558
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
      state: NgeniusPaymentState
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
  cardholderName: string
}

interface NgeniusPayment {
  _id: string
  _links: {
    self: { href: string }
    curies?: Array<{
      name: string
      href: string
      templated: boolean
    }>
    'cnp:3ds2-challenge-response'?: { href: string }
    'cnp:3ds2-authentication'?: { href: string }
    'cnp:3ds'?: { href: string }
  }
  paymentMethod: {
    expiry: string
    cardholderName: string
    name: string
    pan: string
    cvv: string
  }
  reference: string
  outletId: string
  orderReference: string
  state: NgeniusPaymentState
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

interface NgeniusCapture {
  reference: string
  paymentMethod: Record<string, unknown>
  savedCard?: {
    maskedPan: string
    expiry: string
    cardholderName: string
    scheme: string
    cardToken: string
  }
  state: string
  amount: {
    currencyCode: string
    value: number
  }
  updateDateTime: number
  outletId: string
  orderReference: string
  merchantOrderReference: string
  captureData?: Array<{
    amount: {
      currencyCode: string
      value: number
    }
  }>
  refundData?: Array<{
    amount: {
      currencyCode: string
      value: number
    }
    createdTime: number
    state: string
    voidable: boolean
  }>
  cancellable?: boolean
  availablePaymentMethods?: {
    [key: string]: string[]
  }
  displaySavedCard?: boolean
  acceptResultLink?: boolean
  is3dsRequired?: boolean
  capturable?: boolean
  authResponse?: {
    authorizationCode: string
    success: boolean
    resultCode: string
    resultMessage: string
  }
  '3ds'?: {
    status: string
    acsUrl: string
    acsPaReq: string
    acsMd: string
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
  ): Promise<NgeniusOrder> {
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
  ): Promise<NgeniusPayment> {
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

  async getOrder(
    outletId: string,
    orderReference: string,
    testOnly = false
  ): Promise<NgeniusOrder> {
    try {
      const accessToken = await this.getAccessToken(testOnly)
      const url = new URL(
        `/transactions/outlets/${outletId}/orders/${orderReference}`,
        this.getAPIHost(testOnly)
      )

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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

  async capturePayment(
    outletId: string,
    orderReference: string,
    paymentReference: string,
    params: NgeniusCreateOrderAmount,
    testOnly = false
  ): Promise<NgeniusCapture> {
    try {
      const accessToken = await this.getAccessToken(testOnly)
      const url = new URL(
        `/transactions/outlets/${outletId}/orders/${orderReference}/payments/${paymentReference}/captures`,
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

  async refundCapture(
    outletId: string,
    orderReference: string,
    paymentReference: string,
    captureReference: string,
    params: NgeniusCreateOrderAmount,
    testOnly = false
  ) {
    try {
      const accessToken = await this.getAccessToken(testOnly)
      const url = new URL(
        `/transactions/outlets/${outletId}/orders/${orderReference}/payments/${paymentReference}/captures/${captureReference}/refund`,
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

  async createHostedSessionPayment(
    params: ChargeCreateParams,
    sessionId: string,
    outletId: string,
    action: NgeniusCreateOrderAction,
    testOnly = false
  ) {
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
          action,
          amount: {
            value: params.amount,
            currency: params.currency,
          },
        }),
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
}
