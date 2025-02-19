import { ChargeCreateParams, IPaymentProvidable, PayshiftProviderName } from "../common";

export class NgeniusProvider implements IPaymentProvidable {
  public name: PayshiftProviderName = 'ngenius'
  public apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  getAPIHost (testOnly = false): string {
    if (process.env.NODE_ENV !== 'production' || testOnly) {
      return 'https://api-gateway.sandbox.ngenius-payments.com'
    }
    return 'https://api-gateway.ngenius-payments.com'
  }

  async getAccessToken (testOnly = false): Promise<string> {
    try {
      const url = new URL('/identity/auth/access-token', this.getAPIHost(testOnly))
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${this.apiKey}`
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials'
        })
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

  async createPayment (params: ChargeCreateParams, sessionId: string, outletId: string, testOnly = false): Promise<{ data: any }> {
    try {
      const accessToken = await this.getAccessToken(testOnly)
      const url = new URL(`/transactions/outlets/${outletId}/payment/hosted-session/${sessionId}`, this.getAPIHost(testOnly))
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.ni-payment.v2+json',
          Accept: 'application/vnd.ni-payment.v2+json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action: 'SALE',
          amount: {
            value: params.amount,
            currency: params.currency
          },
        })
      })

      if (!res.ok) {
        const data = await res.json()
        console.error(data)
        throw new Error('Failed to complete payment')
      }

      const data = await res.json()

      return {
        data
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}
