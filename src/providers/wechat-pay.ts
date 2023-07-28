import WxPay from 'wechatpay-node-v3'
import { readFileSync } from 'fs'
import {
  ChargeCreateParams,
  IPaymentProvidable,
  PayshiftProviderName } from '../common'


export class WechatPayProvider implements IPaymentProvidable {
  public sdk: WxPay
  public name: PayshiftProviderName = 'wechat_pay'
  private notifyUrl?: string

  constructor (appId: string, mchid: string, publicKeyPath: string, privateKeyPath: string, apikey: string, notifyUrl?: string) {
    this.sdk = new WxPay({
      appid: appId,
      mchid,
      publicKey: readFileSync(publicKeyPath),
      privateKey: readFileSync(privateKeyPath),
      key: apikey,
    })
    this.notifyUrl = notifyUrl
  }

  public async createMobilePaymentLink (charge: ChargeCreateParams, notifyUrl?: string): Promise<string> {
    const params = {
      description: charge.title,
      out_trade_no: charge.outTradeNo,
      notify_url: notifyUrl ?? this.notifyUrl ?? 'http://taobao.com',
      amount: {
        total: charge.amount,
      },
      scene_info: {
        payer_client_ip: charge.clientIp,
        h5_info: {
          type: 'Wap',
          app_name: '',
        },
      },
    }

    const result = await this.sdk.transactions_h5(params)
    if (result.status === 200) {
      return result.h5_url
    }

    throw new Error(`wechat pay launch fails, code ${result.status} ${result.code}, ${result.message}`)
  }

  public async createPaymentQrcodeUrl (charge: ChargeCreateParams, notifyUrl?: string) {
    const params = {
      description: charge.title,
      out_trade_no: charge.outTradeNo,
      notify_url: notifyUrl ?? this.notifyUrl ?? 'http://taobao.com',
      amount: {
        total: charge.amount,
      },
      scene_info: {
        payer_client_ip: charge.clientIp,
      },
    };
    const result = await this.sdk.transactions_native(params)
    if (result.status === 200) {
      return result.code_url
    }

    throw new Error(`wechat pay launch fails, code ${result.status} ${result.code}, ${result.message}`)
  }
}