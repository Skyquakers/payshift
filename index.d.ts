declare module "payshift"

declare type ChargeObject = {
  title: string,
  amount: number,
  outTradeNo: string,
  description?: string,
  tradeNo?: string,
}

declare interface IPaymentProvidable {
  name: PayshiftProviderName;
  sdk: AlipaySdk | WxPay;
}


type ClassImplements<
  I,
  ConstructorArgs extends any[] = any[]
> = new(...args: ConstructorArgs) => I


declare const PaymentProvider: ClassImplements<IPaymentProvidable, []>


declare type PayshiftEventName = 'payment_intent.succeeded' | 'payment_intent.created' |
'charge.succeeded' | 'charge.created' | 'charge.failed'

declare type PayshiftProviderName = 'alipay' | 'wechat_pay' | 'stripe'


declare type PayshiftOptions = {
  usedb?: boolean,
}