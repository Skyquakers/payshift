import axios from 'axios'
import { URLSearchParams } from 'url'
import { CurrencyCode } from '../currency'
import { IPaymentProvidable, PayshiftProviderName } from '../common'


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
    const endpoint = process.env.NODE_ENV === 'production' ? 'https://api-m.paypal.com/v1/oauth2/token' : 'https://api-m.sandbox.paypal.com/v1/oauth2/token'
    const params = new URLSearchParams({
      grant_type: 'client_credentials'
    }).toString()

    try {
      const res = await axios.post(endpoint, params, {
        auth: {
          username: this.clientId,
          password: this.clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
  
      const expiresIn = Number(res.data.expires_in) // secs
      this.accessToken = res.data.access_token

      setTimeout(() => {
        this.accessToken = null
      }, (expiresIn - 3) * 1000)
    } catch (err) {
      console.error(err)
      throw err
    }
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

      const endpoint = process.env.NODE_ENV === 'production' ? 'https://api-m.paypal.com/v1/payments/payouts' : 'https://api-m.sandbox.paypal.com/v1/payments/payouts'

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

      const endpoint = process.env.NODE_ENV === 'production' ? 'https://api-m.paypal.com/v1/identity/openidconnect/tokenservice' : 'https://api-m.sandbox.paypal.com/v1/identity/openidconnect/tokenservice'

      const res = await axios.post(endpoint, params, {
        headers
      })

      return res.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  public async getUserInfo (token: string) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }

      const endpoint = process.env.NODE_ENV === 'production' ? 'https://api-m.paypal.com/v1/oauth2/token/userinfo?schema=openid': 'https://api-m.sandbox.paypal.com/v1/oauth2/token/userinfo?schema=openid'

      const res = await axios.get(endpoint, {
        headers
      })

      return res.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}