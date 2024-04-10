import { PaypalProvider } from './paypal'
import { test, expect } from 'vitest'
import { clientId, secret, testReceiver } from '../../certs/paypal/secret'
import { CurrencyCode } from '../currency'

const testPayout = true

if (testPayout) {
  test('paypal payout', async function () {
    const provider = new PaypalProvider(clientId, secret)
  
    try {
      const testOrderId = new Date().getTime().toString()
      const res = await provider.payoutTo(testOrderId, CurrencyCode.USD, 1, testReceiver, {
        subject: 'this is test payout',
        message: 'this is test message',
      })
      expect(res.sender_batch_header.sender_batch_id).toBe(testOrderId)
    } catch (err) {
      console.error(err.response.data)
    }
  }) 
}