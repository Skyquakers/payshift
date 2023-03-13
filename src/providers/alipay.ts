import AlipaySdk from "alipay-sdk"
import { readFileSync } from "fs"

export class AlipayProvider implements IPaymentProvidable {
  public sdk: AlipaySdk
  public name: PayshiftProviderName = 'alipay'

  constructor (appId: string, privateKeyPath: string, alipayPublicKeyPath: string) {
    this.sdk = new AlipaySdk({
      appId,
      signType: 'RSA2',
      privateKey: readFileSync(privateKeyPath, 'ascii'),
      alipayPublicKey: alipayPublicKeyPath,
    })
  }

  public async createDesktopPaymentLink (charge: ChargeObject, returnUrl: string): Promise<string> {
    const result = this.sdk.pageExec('alipay.trade.page.pay', {
      method: 'GET',
      bizContent: {
        out_trade_no: charge.outTradeNo,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        subject: charge.title,
        body: charge.description,
        total_amount: String(charge.amount / 100),
      },
      return_url: returnUrl
    })

    return result
  }

  public async createMobilePaymentLink (charge: ChargeObject, returnUrl: string): Promise<string> {
    const result = this.sdk.pageExec('alipay.trade.wap.pay', {
      method: 'GET',
      bizContent: {
        out_trade_no: charge.outTradeNo,
        product_code: 'QUICK_WAP_WAY',
        subject: charge.title,
        total_amount: String(charge.amount / 100),
      },
      return_url: returnUrl
    })

    return result
  }
}