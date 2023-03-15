import Stripe from "stripe"
import { CurrencyCode } from "../currency"


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

  public async createPaymentIntent (params: Stripe.PaymentIntentCreateParams) {
    const paymentIntent = await this.sdk.paymentIntents.create(params)
    return paymentIntent
  }

  public async transferTo (accountId: string, options: {
    currency: CurrencyCode,
    amount: number,
    transferGroup?: string,
  }): Promise<Stripe.Transfer> {
    return await this.sdk.transfers.create({
      destination: accountId,
      currency: options.currency,
      transfer_group: options.transferGroup,
    })
  }
}