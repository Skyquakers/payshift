import { Payshift } from "./index"
import { AlipayProvider } from "./providers/alipay"
import { privateKeyPath, alipayPublicKeyPath, appId } from "./configs/alipay"
import { StripeProvider } from "./providers/stripe"
import { testKey, endpointSecret } from "./configs/stripe"
import { WechatPayProvider } from "./providers/wechat-pay"
import { apiKey, mcid, publicKeyPath } from "./configs/wechat-pay"

const alipay = new AlipayProvider(appId, privateKeyPath, alipayPublicKeyPath)
const stripe = new StripeProvider(testKey)
const wechat = new WechatPayProvider(appId, mcid, publicKeyPath, privateKeyPath, apiKey)

const payshift = new Payshift([alipay, stripe, wechat], {
  stripeEndpointSecret: endpointSecret
})
payshift.startWebServer('http://localhost:3000', 3000)