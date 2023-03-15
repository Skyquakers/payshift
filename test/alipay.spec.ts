import { expect } from "chai"
import { AlipayProvider, CurrencyCode } from "../src/index"
import { privateKeyPath, alipayPublicKeyPath, appId } from "../src/configs/alipay"

const provider = new AlipayProvider(appId, privateKeyPath, alipayPublicKeyPath)

describe('AlipayProvider', function () {
  it('desktop payment link should be a string', async function (done) {
    const out_trade_no = 'ALIPfdf1211sdfsd12gfddsgs3'
    const subject = 'abc'
    const body = '234'
    const total_amount = 1

    const url = await provider.createDesktopPaymentLink({
      outTradeNo: out_trade_no,
      title: subject,
      description: body,
      amount: total_amount,
      channel: 'alipay_web',
      currency: CurrencyCode.CNY,
      returnUrl: 'http://taobao.com'
    })

    expect(url).to.be.a('string')
    done()
  })

  it('mobile payment link should be a string', async function (done) {
    const out_trade_no = 'ALIPfdf1211sdfsd12gfddsgs3'
    const subject = 'abc'
    const total_amount = 1

    const url = await provider.createMobilePaymentLink({
      outTradeNo: out_trade_no,
      title: subject,
      amount: total_amount,
      channel: 'alipay_web',
      currency: CurrencyCode.CNY,
      returnUrl: 'http://taobao.com'
    })

    expect(url).to.be.a('string')
    done()
  })
})
