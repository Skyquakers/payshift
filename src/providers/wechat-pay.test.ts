import { expect, describe, it } from "vitest"
import { CurrencyCode, WechatPayProvider } from "../index"
import path from "path"
import { appId, mcid, apiKey } from "../../certs/wechat-pay/secret"

const privateKeyPath = path.join(__dirname, '../../certs/wechat-pay/apiclient-key.pem')
const publicKeyPath = path.join(__dirname, '../../certs/wechat-pay/apiclient-cert.pem')

const provider = new WechatPayProvider(appId, mcid, publicKeyPath, privateKeyPath, apiKey, 'http://www.taobao.com')

describe('WechatPayProvider', function () {
  it('mobile payment link should be a string', async function () {
    const out_trade_no = 'ALIPfdf1211sdfsd12gfddsgs3'
    const subject = 'abc'
    const total_amount = 1
    const return_url = 'http://taobao.com'

    const url = await provider.createMobilePaymentLink({
      outTradeNo: out_trade_no,
      title: subject,
      amount: total_amount,
      channel: 'wechat_mobile_web',
      currency: CurrencyCode.CNY,
      returnUrl: return_url,
      clientIp: '127.0.0.1'
    }, return_url)

    expect(url).to.be.a('string')
  })

  it('qrcode url should be a string', async function () {
    const out_trade_no = 'ALIPfdf1211sdfsd12gfddsgs4'
    const subject = 'abc'
    const total_amount = 1
    const return_url = 'http://taobao.com'

    const url = await provider.createPaymentQrcodeUrl({
      outTradeNo: out_trade_no,
      title: subject,
      amount: total_amount,
      channel: 'wechat_qrcode',
      currency: CurrencyCode.CNY,
      returnUrl: return_url,
      clientIp: '127.0.0.1',
    }, return_url)

    expect(url).to.be.a('string')
  })
})
