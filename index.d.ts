declare module "payshift"

type ChargeObject = {
  title: string,
  amount: number,
  outTradeNo: string,
  description?: string,
}

declare interface IPaymentProvidable {
}


type ClassImplements<
  I,
  ConstructorArgs extends any[] = any[]
> = new(...args: ConstructorArgs) => I


declare const PaymentProvider: ClassImplements<IPaymentProvidable, []>