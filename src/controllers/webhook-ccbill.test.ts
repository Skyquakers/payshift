import { describe, expect, test } from 'vitest'
import {
  flexId,
  salt,
  subAccountId,
  testCCBillWebhookEventNewSale,
  testCCBillWebhookEventRenewalSuccess,
} from '../../certs/ccbill/secret'
import { CCBillProvider, Payshift } from '../index'

const ccbill = new CCBillProvider(subAccountId, salt, flexId)
const payshift = new Payshift([ccbill])
payshift.startWebServer('http://localhost:3000', 3000)

describe('CCBill Webhooks', async function () {
  test('NewSaleSuccess should return OK', async function () {
    const res = await fetch(
      'http://localhost:3000/webhooks/ccbill?eventType=NewSaleSuccess',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCCBillWebhookEventNewSale),
      }
    )

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('OK')
  })

  test('RenewalSuccess should return OK', async function () {
    const res = await fetch(
      'http://localhost:3000/webhooks/ccbill?eventType=RenewalSuccess',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCCBillWebhookEventRenewalSuccess),
      }
    )

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('OK')
  })
})
