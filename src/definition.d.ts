import 'express'
import type { StripeProvider } from './providers/stripe';
import type { WechatPayProvider } from './providers/wechat-pay';
import type { EPayProvider } from './providers/epay';
import type { AlipayProvider } from './providers/alipay';
import type { FakaProvider } from './providers/faka';
import { CCBillProvider } from './providers/ccbill';

interface PayshiftLocals {
  stripe?: StripeProvider
  wechatPay?: WechatPayProvider
  epays?: EPayProvider[]
  alipay?: AlipayProvider
  faka?: FakaProvider
  ccbill?: CCBillProvider
  endpointSecret?: string
  dbUsed?: boolean
}

declare module 'express' {
  export interface Response  {
    locals: PayshiftLocals;
  }
}