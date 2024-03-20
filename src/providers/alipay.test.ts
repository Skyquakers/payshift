import { expect, describe, it } from "vitest"
import { AlipayProvider, CurrencyCode, Payshift } from "../index"
import path from 'path'
import { appId, testReceiver, testPostData } from "../../certs/alipay/secret"
import { readFileSync } from "fs"

export { appId }
export const privateKeyPath = path.join(__filename, '../../../certs/alipay/private-key.pem')
export const alipayPublicKeyPath = path.join(__filename, '../../../certs/alipay/alipay-public-key.crt')

const alipayRootCertPath = path.join(__filename, '../../../certs/alipay/alipayRootCert.crt')
const alipayPublicCertPath = path.join(__filename, '../../../certs/alipay/alipayCertPublicKey_RSA2.crt')
const appCertPath = path.join(__filename, '../../../certs/alipay/appCertPublicKey.crt')
const privateKey = readFileSync(privateKeyPath, 'ascii')

const provider = new AlipayProvider({
  appId,
  signType: 'RSA2',
  privateKey,
  alipayRootCertPath,
  alipayPublicCertPath,
  appCertPath,
}, 'http://www.taobao.com')
const payshift = new Payshift([provider])

describe('AlipayProvider', function () {
  const out_trade_no = 'ALIPfdf1211sdfsd12gfddsgs3'

  it('desktop payment link should be a string', async function () {
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
    const ok = provider.sdk.checkNotifySign(testPostData)
    expect(ok).to.be.true
  })

  it('check transfer', async function () {
    const result = await provider.transfer({
      amountYuan: 0.1,
      outTradeNo: out_trade_no,
      receiver: {
        type: 'ALIPAY_LOGON_ID',
        id: testReceiver.id,
        name: testReceiver.realName,
      },
      title: 'test transfer',
    })

    console.log(result)

    expect(result.code).to.equal('10000')
  })
})
