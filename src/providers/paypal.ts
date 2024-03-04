import axios from 'axios'
import { URLSearchParams } from 'url'
import { CurrencyCode } from '../currency'
import type { ChargeCreateParams, IPaymentProvidable, PayshiftProviderName, PaypalOrder } from '../common'



export class PaypalProvider implements IPaymentProvidable {
  public name: PayshiftProviderName = 'paypal'
  public sdk: any = null

  private clientId: string
  private clientSecret: string
  private accessToken: string | null = null

  constructor (clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  private async getAccessToken () {
    const host = this.getAPIHost()
    const endpoint = new URL('/v1/oauth2/token', host).toString()

    const cipher = `${this.clientId}:${this.clientSecret}`
    const base64 = Buffer.from(cipher).toString('base64')

    try {
      const res = await axios.post(endpoint, 'grant_type=client_credentials', {
        headers: {
          Authorization: `Basic ${base64}`
        }
      })
  
      const expiresIn = Number(res.data.expires_in) // secs
      this.accessToken = res.data.access_token

      setTimeout(() => {
        this.accessToken = null
      }, (expiresIn - 3) * 1000)
    } catch (err: any) {
      console.error(err)
      throw err
    }
  }

  private getAPIHost (): string {
    return process.env.NODE_ENV === 'production' ? 'https://api-m.paypal.com/' : 'https://api-m.sandbox.paypal.com/'
  }

  public async payoutTo (
    txnId: string,
    currency: CurrencyCode,
    value: number,
    receiver: string,
    emailContent: { subject: string, message: string } = { subject: 'You have a payout', message: 'You have a payout to your paypal' }) {
    try {
      if (!this.accessToken) {
        await this.getAccessToken()
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      }

      const data = {
        sender_batch_header: {
          sender_batch_id: txnId,
          recipient_type: 'EMAIL',
          email_subject: emailContent.subject,
          email_message: emailContent.message,
        },
        items: [{
          amount: {
            value: String(value),
            currency,
          },
          sender_item_id: txnId,
          recipient_wallet: 'WALLET',
          receiver,
        }]
      }

      const host = this.getAPIHost()
      const endpoint = new URL('/v1/payments/payouts', host).toString()

      const res = await axios.post(endpoint, data, {
        headers
      })

      return res.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  public async getOpenIdToken (code: string) {
    try {
      const encodedCredentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
      const headers = {
        'Authorization': `Basic ${encodedCredentials}`
      }
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
      }).toString()

      const host = this.getAPIHost()
      const endpoint = new URL('/v1/identity/openidconnect/tokenservice', host).toString()

      const res = await axios.post(endpoint, params, {
        headers
      })

      return res.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  public async getUserInfo (identityToken: string) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${identityToken}`,
      }

      const host = this.getAPIHost()
      const endpoint = new URL('/v1/oauth2/token/userinfo?schema=openid', host).toString()

      const res = await axios.get(endpoint, {
        headers
      })

      return res.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  public async createPayment (
    charge: ChargeCreateParams,
  ): Promise<PaypalOrder> {
    try {
      if (!this.accessToken) {
        await this.getAccessToken()
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      }

      const host = this.getAPIHost()
      const endpoint = new URL('/v2/checkout/orders', host).toString()

      const value = charge.currency === 'JPY' ? String(charge.amount) : (charge.amount / 100).toFixed(2)

      const res = await axios.post(endpoint, {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: charge.currency,
            value, 
          }
        }]
      }, {
        headers,
      })

      return res.data
    } catch (err: any) {
      if (err.response && err.response.data) {
        console.error(err.response.data)
        throw new Error(err.response.data)
      }
      console.error(err)
      throw err
    }
  }

  public async captureOrder (paypalOrderId: string): Promise<PaypalOrder> {
    try {
      if (!this.accessToken) {
        await this.getAccessToken()
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      }

      const host = this.getAPIHost()
      const endpoint = new URL(`/v2/checkout/orders/${paypalOrderId}/capture`, host).toString()

      const res = await axios.post(endpoint, null, {
        headers
      })

      return res.data
    } catch (err: any) {
      if (err.response && err.response.data) {
        throw new Error(err.response.data)
      }
      console.error(err)
      throw err
    }
  }
}