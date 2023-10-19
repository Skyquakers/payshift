import 'express'
import type { StripeProvider } from './providers/stripe';
import type { WechatPayProvider } from './providers/wechat-pay';
import type { EPayProvider } from './providers/epay';
import type { AlipayProvider } from './providers/alipay';
import type { FakaProvider } from './providers/faka';

interface PayshiftLocals {
  stripe?: StripeProvider
  wechatPay?: WechatPayProvider
  epays?: EPayProvider[]
  alipay?: AlipayProvider
  faka?: FakaProvider
  endpointSecret?: string
  dbUsed?: boolean
}

declare module 'express' {
  export interface Response  {
    locals: PayshiftLocals;
  }
}