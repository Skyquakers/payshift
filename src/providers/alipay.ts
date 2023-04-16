import AlipaySdk from "alipay-sdk"
import { readFileSync } from "fs"

export class AlipayProvider implements IPaymentProvidable {
  public sdk: AlipaySdk
  public name: PayshiftProviderName = 'alipay'
  private notifyUrl?: string

  constructor (appId: string, privateKeyPath: string, alipayPublicKeyPath: string, notifyUrl?: string) {
    this.sdk = new AlipaySdk({
      appId,
      signType: 'RSA2',
      privateKey: readFileSync(privateKeyPath, 'ascii'),
      alipayPublicKey: alipayPublicKeyPath,
    })
    this.notifyUrl = notifyUrl
  }

  public async createDesktopPaymentLink (params: ChargeCreateParams): Promise<string> {
    const data: any = {
      method: 'GET',
      bizContent: {
        out_trade_no: params.outTradeNo,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        subject: params.title,
        body: params.description,
        total_amount: String(params.amount / 100),
      },
      notify_url: this.notifyUrl,
    }
    if (params.returnUrl) {
      data.return_url = params.returnUrl
    }
    const result = this.sdk.pageExec('alipay.trade.page.pay', data)

    return result
  }

  public async createMobilePaymentLink (params: ChargeCreateParams): Promise<string> {
    const data: any = {
      method: 'GET',
      bizContent: {
        out_trade_no: params.outTradeNo,
        product_code: 'QUICK_WAP_WAY',
        subject: params.title,
        total_amount: String(params.amount / 100),
      },
      notify_url: this.notifyUrl,
    }
    if (params.returnUrl) {
      data.return_url = params.returnUrl
    }
    const result = this.sdk.pageExec('alipay.trade.wap.pay', data)

    return result
  }
}