import { describe, expect, it } from 'vitest'
import { flexId, salt, subAccountId } from '../../certs/ccbill/secret'
import { CCBillProvider, CurrencyCode, Payshift } from '../index'

const provider = new CCBillProvider(subAccountId, salt, flexId)
const payshift = new Payshift([provider])

describe('CCBillProvider', function () {
  it('desktop payment link should be a string', async function () {
    const out_trade_no = 'ALIPfdf1211sdfsd12gfddsgs3'
    const subject = 'abc'
    const body = '234'
    const total_amount = 295

    const { data: url } = await payshift.createCharge({
      outTradeNo: out_trade_no,
      title: subject,
      description: body,
      amount: total_amount,
      channel: 'ccbill_web',
      currency: CurrencyCode.USD,
      returnUrl: 'http://taobao.com',
      clientIp: '127.0.0.1',
    })
    console.log(url)
    expect(url).to.be.a('string')
  })

  it('subscription link should be a string', async function () {
    const out_trade_no = 'ALIPfdf1211sdfsd12gfddsgs3'
    const subject = 'abc'
    const body = '234'
    const total_amount = 295
    const url = provider.createSubscriptionLink(
      {
        outTradeNo: out_trade_no,
        title: subject,
        description: body,
        amount: total_amount,
        channel: 'ccbill_web',
        currency: CurrencyCode.USD,
        returnUrl: 'http://taobao.com',
        clientIp: '127.0.0.1',
      },
      30,
      30
    )
    console.log(url)
    expect(url).to.be.a('string')
  })
})
