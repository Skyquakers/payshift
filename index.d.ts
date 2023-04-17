declare module "payshift"

declare type ChargeCreateParams = {
  title: string,
  amount: number,
  outTradeNo: string,
  currency: CurrencyCode,
  returnUrl?: string,
  channel: PayshiftChannel,
  description?: string,
  clientIp: string,
}

declare type ChargeObject = {
  title: string,
  amount: number,
  outTradeNo: string,
  channel: PayshiftChannel,
  description?: string,
  tradeNo?: string,
  currency: CurrencyCode,
  clientIp: string,
}

declare type ChargeResponse = {
  charge: ChargeObject,
  data: any,
  chargeId?: string,
}

declare interface IPaymentProvidable {
  name: PayshiftProviderName;
  sdk: AlipaySdk | WxPay | Stripe;
  webhookEndpoint?: string,
}


type ClassImplements<
  I,
  ConstructorArgs extends any[] = any[]
> = new(...args: ConstructorArgs) => I


declare const PaymentProvider: ClassImplements<IPaymentProvidable, []>


declare type PayshiftEventName = 'payment_intent.succeeded' | 'payment_intent.created' |
'charge.succeeded' | 'charge.created' | 'charge.failed' |
'account.updated' | 'account.application.deauthorized' | 'account.external_account.updated' |
'balance.available' |
'payout.failed'


declare type PayshiftProviderName = 'alipay' | 'wechat_pay' | 'stripe' | 'paymentcloud' | 'shift4' | 'paxum'


declare type PayshiftChannel = 'stripe_web' | 'alipay_web' | 'wechat_qrcode' |
'wechat_mobile_web' | 'alipay_mobile_web'


declare type PayshiftOptions = {
  usedb?: boolean,
  stripeEndpointSecret?: string,
}