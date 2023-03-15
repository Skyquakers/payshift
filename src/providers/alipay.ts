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

  public async createDesktopPaymentLink (params: ChargeCreateParams): Promise<string> {
    const result = this.sdk.pageExec('alipay.trade.page.pay', {
      method: 'GET',
      bizContent: {
        out_trade_no: params.outTradeNo,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        subject: params.title,
        body: params.description,
        total_amount: String(params.amount / 100),
      },
      return_url: params.returnUrl
    })

    return result
  }

  public async createMobilePaymentLink (params: ChargeCreateParams): Promise<string> {
    const result = this.sdk.pageExec('alipay.trade.wap.pay', {
      method: 'GET',
      bizContent: {
        out_trade_no: params.outTradeNo,
        product_code: 'QUICK_WAP_WAY',
        subject: params.title,
        total_amount: String(params.amount / 100),
      },
      return_url: params.returnUrl
    })

    return result
  }
}