import { expect } from "chai"
import { EPayProvider, Payshift, CurrencyCode } from "../src/index"
import { pid, key } from "../certs/epay/secret"

const provider = new EPayProvider('https://pay.cjyzf.com/', pid, key)
const payshift = new Payshift([provider])

describe('EPayProvider', function () {
  it('create payment should return a result', async function () {
    const out_trade_no = 'ALIPfdf1211sdfsd12gfddsgs3'
    const subject = 'abc'
    const body = '234'
    const total_amount = 1
    const { data } = await payshift.createCharge({
      outTradeNo: out_trade_no,
      title: subject,
      description: body,
      amount: total_amount,
      channel: 'epay_alipay',
      currency: CurrencyCode.CNY,
      returnUrl: 'http://taobao.com',
      clientIp: '127.0.0.1',
    })

    expect(data).to.be.an('object')
  })
})