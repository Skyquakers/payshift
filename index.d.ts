declare module "payshift"

declare type ChargeObject = {
  title: string,
  amount: number,
  outTradeNo: string,
  description?: string,
  tradeNo?: string,
}

declare interface IPaymentProvidable {
}


type ClassImplements<
  I,
  ConstructorArgs extends any[] = any[]
> = new(...args: ConstructorArgs) => I


declare const PaymentProvider: ClassImplements<IPaymentProvidable, []>


declare enum PayshiftEventName {
  PaymentIntentSucceeded = 'payment_intent.succeeded',
  PaymentIntentCreated = 'payment_intent.created',
  ChargeSucceeded = 'charge.succeeded',
  ChargeCreated = 'charge.created',
  ChargeFailed = 'charge.failed',
}

declare enum PayshiftProviderName {
  Alipay = 'alipay',
  WechatPay = 'wechat_pay',
  Stripe = 'stripe',
}

declare type PayshiftEvent = {
  amount: number,
  title: string,
  outTradeNo: string,
  tradeNo: string,
  provider?: PayshiftProviderName,
}