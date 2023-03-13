import { expect } from "chai"
import { WechatPayProvider } from "../src/providers/wechat-pay"
import { privateKeyPath, publicKeyPath, appId, mcid, apiKey } from "../src/configs/wechat-pay"


const provider = new WechatPayProvider(appId, mcid, publicKeyPath, privateKeyPath, apiKey)

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
    }, return_url)

    expect(url).to.be.a('string')
  })
})
