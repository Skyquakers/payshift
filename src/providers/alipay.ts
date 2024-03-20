import AlipaySdk, { type AlipaySdkCommonResult, AlipaySdkConfig } from "alipay-sdk"
import {
  ChargeCreateParams,
  IPaymentProvidable,
  PayshiftProviderName,
  AlipayTransferParams
} from '../common'

export class AlipayProvider implements IPaymentProvidable {
  public sdk: AlipaySdk
  public name: PayshiftProviderName = 'alipay'
  private notifyUrl?: string

  constructor (config: AlipaySdkConfig, notifyUrl?: string) {
    this.sdk = new AlipaySdk(config)
    this.notifyUrl = notifyUrl
  }

  public createDesktopPaymentLink (params: ChargeCreateParams): string {
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

  public createMobilePaymentLink (params: ChargeCreateParams): string {
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

  public async transfer(params: AlipayTransferParams): Promise<AlipaySdkCommonResult> {
    const data: any = {
      bizContent: {
        out_biz_no: params.outTradeNo,
        trans_amount: params.amountYuan.toFixed(2),
        biz_scene: 'DIRECT_TRANSFER',
        product_code: 'TRANS_ACCOUNT_NO_PWD',
        order_title: params.title,
        payee_info: {
          identity: params.receiver.id,
          identity_type: params.receiver.type,
          name: params.receiver.name
        },
        remark: params.title
      }
    }

    const result = await this.sdk.exec('alipay.fund.trans.uni.transfer', data)
    return result
  }
}