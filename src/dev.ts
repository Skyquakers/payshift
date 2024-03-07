import { Payshift } from "./index"
import { AlipayProvider } from "./providers/alipay"
import { appId } from "../certs/alipay/secret"
import { StripeProvider } from "./providers/stripe"
import { testKey, endpointSecret } from "../certs/stripe/secret"
import { WechatPayProvider } from "./providers/wechat-pay"
import { apiKey, mcid } from "../certs/wechat-pay/secret"
import path from "path"

const wxPublicKeyPath = path.join(__dirname, '../../certs/wechat-pay/apiclient-cert.pem')
const privateKeyPath = path.join(__filename, '../../certs/alipay/private-key.pem')
const alipayPublicKeyPath = path.join(__filename, '../../certs/alipay/alipay-public-key.crt')

const alipay = new AlipayProvider(appId, privateKeyPath, alipayPublicKeyPath)
const stripe = new StripeProvider(testKey)
const wechat = new WechatPayProvider(appId, mcid, wxPublicKeyPath, privateKeyPath, apiKey)

const payshift = new Payshift([alipay, stripe, wechat], {
  stripeEndpointSecret: endpointSecret
})
payshift.startWebServer('http://localhost:3000', 3000)