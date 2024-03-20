# Payshift

unified payment api for multiple payment processors

## Installation

```bash
npm install payshift
```

## Supported Payment Processors

- Alipay
- Wechat Pay
- Stripe
- Paypal
- EPay
- Multiple EPay instances with round robin algorithm to split your cashflow and risk
- CCBill

## Usage

```javascript
import {
  Payshift,
  AlipayProvider,
  StripeProvider,
  WechatPayProvider,
  EPayProvider,
  EPayClusterProvider
} from "payshift"
import { privateKeyPath, alipayPublicKeyPath, appId } from "your alipay config"
import { testKey, endpointSecret } from "your stripe config"
import { apiKey, mcid, publicKeyPath } from "your wechatpay config"
import { pid, key, endpoint } from "your epay config"

const alipay = new AlipayProvider({ 
  appId,
  privateKey: fs.readFileSync(path.join(__filename, privateKeyPath))
  alipayPublicKey: fs.readFileSync(path.join(__filename, alipayPublicKeyPath))
})
const stripe = new StripeProvider(testKey)
const wechat = new WechatPayProvider(appId, mcid, publicKeyPath, privateKeyPath, apiKey)
const epay = new EPayProvider(endpoint, pid, key)
const anotherEPay = new EPayProvider(anotherEndpoint, anotherPid, anotherKey)
const epayCluster = new EPayClusterProvder([epay, anotherEPay])

const payshift = new Payshift([alipay, stripe, wechat, epay, epayCluster], {
  stripeEndpointSecret: endpointSecret
})
// webhooks server, used for notify_url for some payments
payshift.startWebServer('http://localhost:3000', 3000)

// optionally, you can use mongodb to save your txns in "payshift" database
payshit.usedb()

// handle webhooks using the internal webhook server
payshift.on('charge.succeeded', async event => {
  // handle event, eg. update the status of your order
  // throwing any error will fail the webhook to the payment processor as well
})
```

Where `event` is a `PayshiftEvent`

```typescript
type PayshiftEvent = {
  amount?: number, // in cents
  title?: string,
  outTradeNo?: string,
  tradeNo?: string,
  provider: PayshiftProviderName,
  name: PayshiftEventName,
  currency?: CurrencyCode,
  accountId?: string,
}
```


Then

```javascript
// depending on your channel, res varys
const res = await payshift.createCharge({
  outTradeNo: '123123123',
  title: 'item',
  amount: 1,
  channel: 'alipay_mobile_web',
  currency: CurrencyCode.CNY,
  returnUrl: 'http://taobao.com',
  clientIp: '127.0.0.1',
})

// in this case for alipay_mobile_web, res.data is a string of url
return res.data
```


## Supported Payment Channels

```typescript
type PayshiftChannel = 'stripe_web' | 'alipay_web' | 'wechat_qrcode' |
'wechat_mobile_web' | 'alipay_mobile_web' | 'epay_alipay' | 'epay_wechat_pay' |
'epay_cluster_alipay' | 'epay_cluster_wechat_pay' | 'order2faka' | 'paypal' | 'ccbill_web'
```

## Using Provider Alone

Of course you can use provider independently

```javascript
const provider = new StripeProvider(testKey)
const accountId = await provider.createAccount({
  country: 'JP',
  type: 'express',
  business_type: 'individual',
  capabilities: { transfers: { requested: true }},
  tos_acceptance: { service_agreement: 'recipient' },
})
const url = await provider.createAccountLink(accountId, 'http://taobao.com', 'http://taobao.com')
console.log(url)
```