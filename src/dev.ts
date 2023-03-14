import { Payshift } from "./index"
import { AlipayProvider } from "./providers/alipay"
import { privateKeyPath, alipayPublicKeyPath, appId } from "./configs/alipay"
import { StripeProvider } from "./providers/stripe"
import { testKey, endpointSecret } from "./configs/stripe"

const alipay = new AlipayProvider(appId, privateKeyPath, alipayPublicKeyPath)
const stripe = new StripeProvider(testKey)
const payshift = new Payshift([alipay, stripe], {
  stripeEndpointSecret: endpointSecret
})
payshift.startWebServer('http://localhost:3000', 3000)