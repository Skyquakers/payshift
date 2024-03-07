import { EPayProvider, Payshift, CurrencyCode } from "../index"
import { pid, key, endpoint } from "../../certs/epay/secret"
import { EPayClusterProvider } from "./epay-cluster"
import { expect } from 'vitest'

const subProvider = new EPayProvider(endpoint, pid, key, 'http://taobao.com')
const providers = [subProvider, subProvider, subProvider]
const provider = new EPayClusterProvider(providers)
const payshift = new Payshift([provider])

describe('EPayClusterProvider', function () {
  it('create payment should return a result', async function () {
    const out_trade_no = 'ALIPfdf1211sdfsd12gfddsgs4'
    const subject = 'abc'
    const body = '234'
    const total_amount = 1

    const promises: Promise<any>[] = []

    for (let index = 0; index < providers.length + 1; index++) {
      promises.push(payshift.createCharge({
        outTradeNo: out_trade_no,
        title: subject,
        description: body,
        amount: total_amount,
        channel: 'epay_cluster_alipay',
        currency: CurrencyCode.CNY,
        returnUrl: 'http://taobao.com',
        clientIp: '127.0.0.1',
      }))
    }

    const datas = await Promise.all(promises)
    datas.forEach(data => expect(data).to.be.an('object'))
  })
})