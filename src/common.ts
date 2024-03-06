import Stripe from "stripe"
import { CurrencyCode } from "./currency"
import AlipaySdk from "alipay-sdk"
import WxPay from 'wechatpay-node-v3'

export type ChargeCreateParams = {
  title: string,
  amount: number,
  outTradeNo: string,
  currency: CurrencyCode,
  returnUrl?: string,
  channel: PayshiftChannel,
  description?: string,
  clientIp: string,
  userAgent?: string
}

export type ChargeObject = {
  title: string,
  amount: number,
  outTradeNo: string,
  channel: PayshiftChannel,
  description?: string,
  tradeNo?: string,
  currency: CurrencyCode,
  clientIp: string,
  userAgent?: string
}

export type ChargeResponse = {
  charge: ChargeObject,
  data: any,
  chargeId?: string,
}

export interface IPaymentProvidable {
  name: PayshiftProviderName;
  sdk?: AlipaySdk | WxPay | Stripe;
  webhookEndpoint?: string,
}


export type ClassImplements<
  I,
  ConstructorArgs extends any[] = any[]
> = new(...args: ConstructorArgs) => I


export type PayshiftEventName = 'payment_intent.succeeded' | 'payment_intent.created' |
'charge.succeeded' | 'charge.created' | 'charge.failed' |
'account.updated' | 'account.application.deauthorized' | 'account.external_account.updated' |
'balance.available' |
'payout.failed' | 'payout.paid' |
'identity.verification_session.verified' | 'identity.verification_session.requires_input' | 'identity.verification_session.created' |
'customer.subscription.updated' | 'customer.subscription.deleted' |
'invoice.created' | 'invoice.finalized' | 'invoice.finalization_failed' | 'invoice.paid'


export type PayshiftProviderName = 'alipay' | 'wechat_pay' | 'stripe' | 'paypal' | 'epay' | 'epay_cluster' | 'order2faka' | 'ccbill'


export type PayshiftChannel = 'stripe_web' | 'alipay_web' | 'wechat_qrcode' |
'wechat_mobile_web' | 'alipay_mobile_web' | 'epay_alipay' | 'epay_wechat_pay' |
'epay_cluster_alipay' | 'epay_cluster_wechat_pay' | 'order2faka' | 'paypal'


export type PayshiftOptions = {
  usedb?: boolean,
  stripeEndpointSecret?: string,
}

type AlipayAccountIdentityType = 'ALIPAY_USER_ID' | 'ALIPAY_LOGON_ID' | 'ALIPAY_OPEN_ID'

export type AlipayTransferParams = {
  amountYuan: number,
  outTradeNo: string,
  title: string,
  receiver: {
    type: AlipayAccountIdentityType,
    name: string,
    id: string,
  }
}


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