# Payshift

unified payment api for multiple payment processors


## Supported Payment Processors

- Alipay
- Wechat Pay
- Stripe

## Usage

```
import { AlipayProvider } from 'payshift'

const provider = AlipayProvider()
const url = await provider.createPaymentLink()

// go to url to finish payment
```