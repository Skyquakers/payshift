import { PaypalProvider } from './paypal'
import { test, expect } from 'vitest'
import { clientId, secret, testReceiver } from '../../certs/paypal/secret'
import { CurrencyCode } from '../currency'


test('paypal payout', async function () {
  const provider = new PaypalProvider(clientId, secret)

  const testOrderId = new Date().getTime().toString()
  const res = await provider.payoutTo(testOrderId, CurrencyCode.JPY, 1, testReceiver, {
    subject: 'this is test payout',
    message: 'this is test message',
  })
  expect(res.batch_header.sender_batch_header.sender_batch_id).toBe(testOrderId)
})