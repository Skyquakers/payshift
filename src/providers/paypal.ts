import axios from 'axios'
import { URLSearchParams } from 'url'
import { CurrencyCode } from '../currency'
import type { ChargeCreateParams, IPaymentProvidable, PayshiftProviderName } from '../common'

type PaypalOrderAmount = {
  currency_code: string,
  value: string,
}

type PaypalShippingType = 'SHIPPING' | 'PICKUP_IN_PERSON' | 'PICKUP_IN_STORE' | 'PICKUP_FROM_PERSON'

type PaypalOrderItem = {
  name: string,
  quantity: string,
  description?: string,
  sku?: string,
  url?: string,
  category?: string,
  image_url?: string,
  unit_amount: {
    currency_code: string,
    value: string,
  },
  tax?: {},
  upc?: {},
}

type PaypalOrderLink = {
  href: string,
  rel: string,
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'PATCH'
}

type PaypalAddress = {
  address_line_1?: string,
  address_line_2?: string,
  admin_area_2?: string,
  admin_area_1?: string,
  postal_code?: string,
  country_code: string,
}

type PaypalNetworkTransactionReference = {
  id: string,
  date?: string,
  acquirer_reference_number?: string,
  network?: 'VISA' | 'MASTERCARD' | 'DISCOVER' | 'AMEX' | 'SOLO' | 'JCB' | 'STAR' | 'DELTA' | 'SWITCH' |
    'MAESTRO' | 'CB_NATIONALE' | 'CONFIGOGA' | 'CONFIDIS' | 'ELECTRON' | 'CETELEM' | 'CHINA_UNION_PAY',
}

type PaypalSellerProtection = {
  status?: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE',
  dispute_categories?: string[],
}

type PaypalProcessorResponse = {
  avs_code?: string,
  cvv_code?: string,
  response_code?: string,
  payment_advice_code?: string,
}

type PaypalSellerReceivableBreakdown = {
  platform_fees?: [],
  gross_amount: PaypalOrderAmount,
  paypal_fee?: PaypalOrderAmount,
  paypal_fee_in_receivable_currency?: PaypalOrderAmount,
  net_amount?: PaypalOrderAmount,
  receivable_amount?: PaypalOrderAmount,
  exchange_rate?: {
    value?: string,
    source_currency?: string,
    target_currency?: string,
  },
}

export type PaypalOrder = {
  create_time?: string,
  update_time?: string,
  id?: string,
  processing_instruction?: 'ORDER_COMPLETE_ON_PAYMENT_APPROVAL' | 'NO_INSTRUCTION',
  purchase_units?: {
    reference_id?: string,
    description?: string,
    custom_id?: string,
    invoice_id?: string,
    id?: string,
    soft_descriptor?: string,
    items?: PaypalOrderItem[],
    amount?: {
      currency_code: string,
      value: string,
      breakdown?: {
        item_total?: PaypalOrderAmount,
        shipping?: PaypalOrderAmount,
        handling?: PaypalOrderAmount,
        tax_total?: PaypalOrderAmount,
        issurance?: PaypalOrderAmount,
        shipping_discount?: PaypalOrderAmount,
        discount?: PaypalOrderAmount,
      }
    },
    payee?: {
      email_address?: string,
      merchant_id?: string,
    },
    payment_instruction?: {
      platform_fees?: {
        amount: PaypalOrderAmount,
        payee?: {
          email_address?: string,
          merchant_id?: string,
        }
      }[],
      payee_pricing_tier_id?: string,
      payee_receivable_fx_rate_id?: string,
      disbursement_mode?: 'INSTANT' | 'DELAYED',
    },
    shipping?: {
      type?: PaypalShippingType,
      options?: {
        id: string,
        label: string,
        selected: boolean,
        type?: PaypalShippingType,
        amount?: PaypalOrderAmount,
      }[],
      name?: {
        given_name?: string,
        surname?: string,
      },
      address?: PaypalAddress,
      trackers?: {
        status?: 'CANCELLED' | 'SHIPPED',
        items?: PaypalOrderItem[],
        links?: PaypalOrderLink[],
        create_time?: string,
        update_time?: string,
      }[],
    },
    supplementary_data?: {
      card?: {
        level_2?: {
          invoice_id?: string,
          tax_total?: PaypalOrderAmount,
        },
        level_3?: {
          ships_from_postal_code?: string,
          line_items?: PaypalOrderItem[],
          shipping_amount?: PaypalOrderAmount,
          duty_amount?: PaypalOrderAmount,
          discount_amount?: PaypalOrderAmount,
          shipping_address?: PaypalAddress,
        },
      }
    },
    payments?: {
      authorizations?: {
        status?: 'CREATED' | 'CAPTURED' | 'DENIED' | 'PARTIALLY_CAPTURED' | 'VOIDED' | 'PENDING',
        status_details?: {
          reason?: 'PENDING_REVIEW',
        },
        id?: string,
        invoice_id?: string,
        custom_id?: string,
        links?: PaypalOrderLink[],
        amount?: PaypalOrderAmount,
        network_transaction_reference?: PaypalNetworkTransactionReference,
        seller_protection?: PaypalSellerProtection,
        expiration_time?: string,
        create_time?: string,
        update_time?: string,
        processor_response?: PaypalProcessorResponse
      }[],
      captures?: {
        status?: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED' | 'FAILED',
        status_details?: {
          reason?: 'BUYER_COMPLAINT' | 'CHARGEBACK' | 'ECHECK' | 'INTERNATIONAL_WITHDRAWAL' | 'OTHER' | 'PENDING_REVIEW' |
            'RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION' | 'REFUNDED' | 'TRANSACTION_APPROVED_AWAITING_FUNDING' | 'UNILATERAL' |
            'VERIFICATION_REQUIRED'
        },
        id?: string,
        invoice_id?: string,
        custom_id?: string,
        final_capture?: boolean,
        disbursement_mode?: 'INSTANT' | 'DELAYED',
        links?: PaypalOrderLink[],
        amount?: PaypalOrderAmount,
        network_transaction_reference?: PaypalNetworkTransactionReference,
        seller_protection?: PaypalSellerProtection,
        seller_receivable_breakdown?: PaypalSellerReceivableBreakdown,
        processor_response?: PaypalProcessorResponse,
        create_time?: string,
        update_time?: string,
      }[],
      refunds?: {
        status?: 'CANCELLED' | 'FAILED' | 'PENDING' | 'COMPLETED',
        status_details?: {
          reason?: 'ECHECK',
        },
        id?: string,
        invoice_id?: string,
        custom_id?: string,
        acquirer_reference_number?: string,
        note_to_payer?: string,
        seller_payable_breakdown?: PaypalSellerReceivableBreakdown,
        links?: PaypalOrderLink[],
        amount?: PaypalOrderAmount,
        payer?: {
          email_address?: string,
          merchant_id?: string,
        },
        create_time?: string,
        update_time?: string,
      }[],
    }[]
  }[],
  links?: PaypalOrderLink[],
  payment_source?: {
    card?: {},
    bancontact?: {},
    blik?: {},
    eps?: {},
    giropay?: {},
    ideal?: {},
    mybank?: {},
    p24?: {},
    sofort?: {},
    trustly?: {},
    venmo?: {},
    paypal?: {},
  },
  intent?: 'CAPTURE' | 'AUTHORIZE',
  payer?: {
    email_address?: string,
    payer_id?: string,
    name?: {
      given_name?: string,
      surname?: string,
    },
    phone?: {
      phone_type?: 'FAX' | 'HOME' | 'MOBILE' | 'OTHER' | 'PAGER',
      phone_number: {
        national_number: string
      },
    },
    birth_date?: string,
    tax_info: {
      tax_id: string,
      tax_id_type: 'BR_CPF' | 'BR_CNPJ'
    },
    address?: PaypalAddress,
  },
  status?: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED'
}

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
    } catch (err) {
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
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}