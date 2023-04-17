import { expect } from "chai"
import { AlipayProvider, CurrencyCode, Payshift } from "../src/index"
import { privateKeyPath, alipayPublicKeyPath, appId } from "../src/configs/alipay"

const provider = new AlipayProvider(appId, privateKeyPath, alipayPublicKeyPath, 'http://www.taobao.com')
const payshift = new Payshift([provider])

describe('AlipayProvider', function () {
  it('desktop payment link should be a string', async function () {
    const out_trade_no = 'ALIPfdf1211sdfsd12gfddsgs3'
    const subject = 'abc'
    const body = '234'
    const total_amount = 1

    const { data: url } = await payshift.createCharge({
      outTradeNo: out_trade_no,
      title: subject,
      description: body,
      amount: total_amount,
      channel: 'alipay_web',
      currency: CurrencyCode.CNY,
      returnUrl: 'http://taobao.com',
      clientIp: '127.0.0.1',
    })
    expect(url).to.be.a('string')
  })

  it('mobile payment link should be a string', async function () {
    const out_trade_no = 'ALIPfdf1211sdfsd12gfddsgs3'
    const subject = 'abc'
    const total_amount = 1

    const { data: url } = await payshift.createCharge({
      outTradeNo: out_trade_no,
      title: subject,
      amount: total_amount,
      channel: 'alipay_mobile_web',
      currency: CurrencyCode.CNY,
      returnUrl: 'http://taobao.com',
      clientIp: '127.0.0.1',
    })
    expect(url).to.be.a('string')
  })

  it('check post data sign', async function () {
    const postData = {
      "gmt_create": "2023-04-17 09:24:53",
      "charset": "utf-8",
      "gmt_payment": "2023-04-17 09:25:01",
      "notify_time": "2023-04-17 09:28:38",
      "subject": "充值",
      "sign": "lf0APvw31Kk/c3fJwaBx6Ej7U+SKpQxaJNdzEjodQ6SJWrrnjwwXQLfvfEtnMpLx/QGZd7Srq6yBh76PmoNLk3xpRI0JWdLn0elQg7fmOlMxqcLR/fwGHgc85Mmc6HGSMQuGUTzWI1IE582U2iGkAzQk6fx0SpjKcL18VLt50A8Eldg32Htx47c0MLdWA5pi33jJ2hHUq81vbFWc0HbJx4qfXpr3gWa2ExGiAoVoayy5c/OqL3hHt8CuFMWTHH8aQnXfnW6GLBugbq/zl0CZfOLiMVAwRZoPxfdKlvudqGhCwMuSiZkP1iqPbBwW9AU9YpNiyhKGcL2sG5J2DXAahw==",
      "buyer_id": "2088802454317811",
      "body": "充值",
      "invoice_amount": "0.12",
      "version": "1.0",
      "notify_id": "2023041701222092502017811460041582",
      "fund_bill_list": "[{\"amount\":\"0.12\",\"fundChannel\":\"ALIPAYACCOUNT\"}]",
      "notify_type": "trade_status_sync",
      "out_trade_no": "113d4da086cb416bb4a36b604eb30df3",
      "total_amount": "0.12",
      "trade_status": "TRADE_SUCCESS",
      "trade_no": "2023041722001417811440831200",
      "auth_app_id": "2021002148600972",
      "receipt_amount": "0.12",
      "point_amount": "0.00",
      "buyer_pay_amount": "0.12",
      "app_id": "2021002148600972",
      "sign_type": "RSA2",
      "seller_id": "2088141641138935"
    }
    const ok = provider.sdk.checkNotifySign(postData)
    expect(ok).to.be.true
  })
})
