import { expect } from "chai"
import { StripeProvider } from "../src/index"
import { testKey } from "../certs/stripe/secret"


const provider = new StripeProvider(testKey)

beforeEach(async function () {
  const accounts = await provider.sdk.accounts.list()
  const promises = []
  for (const account of accounts.data.values()) {
    promises.push(provider.sdk.accounts.del(account.id))
  }

  await Promise.all(promises)
})

describe('StripeProvider', function () {
  it('should return string and url', async function () {
    const accountId = await provider.createAccount({
      country: 'JP',
      type: 'express',
      business_type: 'individual',
      capabilities: { transfers: { requested: true }},
      tos_acceptance: { service_agreement: 'recipient' },
    })
    const url = await provider.createAccountLink(accountId, 'http://taobao.com', 'http://taobao.com')
    console.log(url)
    expect(url).to.be.a('string')
  })
})