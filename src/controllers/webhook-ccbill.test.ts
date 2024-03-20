import { beforeAll, describe, expect, test } from "vitest"
import { CCBillProvider, Payshift } from "../index"
import { salt, subAccountId, flexId, testCCBillWebhookEvent } from "../../certs/ccbill/secret"


const ccbill = new CCBillProvider(subAccountId, salt, flexId)
const payshift = new Payshift([ccbill])
payshift.startWebServer('http://localhost:3000', 3000)

describe('CCBill Webhooks', async function () {
  test('NewSaleSuccess should return OK', async function () {
    const res = await fetch('http://localhost:3000/webhooks/ccbill?eventType=NewSaleSuccess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCCBillWebhookEvent),
    })

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('OK')
  })
})