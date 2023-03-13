import chai, { expect } from "chai"
import { Payshift } from "../src/index"
import chaiHttp from 'chai-http'
import { AlipayProvider } from "../src/providers/alipay.js"
import { privateKeyPath, alipayPublicKeyPath, appId } from "../src/configs/alipay.js"


chai.use(chaiHttp)

const alipay = new AlipayProvider(appId, privateKeyPath, alipayPublicKeyPath)
const payshift = new Payshift([alipay])
payshift.startWebServer('http://localhost:3000', 3000)

describe('Webhooks', function () {
  it('should return fail because it\'s not sent from alipay', function (done) {
    chai.request(payshift.webserver)
        .post('/webhooks/alipay')
        .end((err, res) => {
          if (err) {
            console.error(err)
          }
          expect(res.text).to.equal('fail')
          done()
        })
  })

  it('should return fail because it\'s not sent from stripe', function (done) {
    chai.request(payshift.webserver)
        .post('/webhooks/stripe')
        .end((err, res) => {
          if (err) {
            console.error(err)
          }
          expect(res.text).to.equal('fail')
          done()
        })
  })

  it('should return FAIL because it\'s not sent from wechat', function (done) {
    chai.request(payshift.webserver)
        .post('/webhooks/wechat_pay')
        .end((err, res) => {
          if (err) {
            console.error(err)
          }
          
          expect(res.body.code).to.equal('FAIL')
          done()
        })
  })
})