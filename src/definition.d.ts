import 'express'
import type { AlipayProvider } from './providers/alipay'
import { CCBillProvider } from './providers/ccbill'
import type { EPayProvider } from './providers/epay'
import type { FakaProvider } from './providers/faka'
import type { StripeProvider } from './providers/stripe'
import type { WechatPayProvider } from './providers/wechat-pay'

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
  export interface Response {
    locals: PayshiftLocals
  }
}
