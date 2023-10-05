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
'payout.failed' |
'identity.verification_session.verified' | 'identity.verification_session.requires_input' | 'identity.verification_session.created' |
'customer.subscription.updated' | 'customer.subscription.deleted' |
'invoice.created' | 'invoice.finalized' | 'invoice.finalization_failed' | 'invoice.paid'


export type PayshiftProviderName = 'alipay' | 'wechat_pay' | 'stripe' | 'paypal' | 'epay'


export type PayshiftChannel = 'stripe_web' | 'alipay_web' | 'wechat_qrcode' |
'wechat_mobile_web' | 'alipay_mobile_web' | 'epay_alipay' | 'epay_wechat_pay'


export type PayshiftOptions = {
  usedb?: boolean,
  stripeEndpointSecret?: string,
}