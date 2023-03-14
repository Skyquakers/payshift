import Stripe from "stripe"


export class StripeProvider implements IPaymentProvidable {
  public sdk: Stripe
  public name: PayshiftProviderName = 'stripe'

  constructor (apiKey: string) {
    this.sdk = new Stripe(apiKey, {
      apiVersion: '2022-11-15'
    })
  }

  public async createAccount (params: Stripe.AccountCreateParams): Promise<string> {
    const account = await this.sdk.accounts.create(params)
    return account.id
  }

  public async createAccountLink (accountId: string, returnUrl: string, refreshUrl: string): Promise<string> {
    const result = await this.sdk.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return result.url
  }
}