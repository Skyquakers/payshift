# Payshift

unified payment api for multiple payment processors


## Supported Payment Processors

- Alipay
- Wechat Pay
- Stripe
- Paypal
- EPay

## Usage

```javascript
import { Payshift, AlipayProvider, StripeProvider, WechatPayProvider } from "payshift"
import { privateKeyPath, alipayPublicKeyPath, appId } from "your alipay config"
import { testKey, endpointSecret } from "your stripe config"
import { apiKey, mcid, publicKeyPath } from "your wechatpay config"
import { pid, key } from "your epay config"

const alipay = new AlipayProvider(appId, privateKeyPath, alipayPublicKeyPath)
const stripe = new StripeProvider(testKey)
const wechat = new WechatPayProvider(appId, mcid, publicKeyPath, privateKeyPath, apiKey)
const epay = new EPayProvider(pid, key)

const payshift = new Payshift([alipay, stripe, wechat, epay], {
  stripeEndpointSecret: endpointSecret
})
// webhooks server, used for notify_url for some payments
payshift.startWebServer('http://localhost:3000', 3000)

// optionally, you can use mongodb to save your txns in "payshift" database
payshit.usedb()

// handle webhooks using the internal webhook server
payshift.on('charge.succeeded', event => {
  // handle event
})
```