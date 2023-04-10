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

  public async createCustomer (params: Stripe.CustomerCreateParams): Promise<Stripe.Customer> {
    return await this.sdk.customers.create(params)
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
      amount: options.amount
    })
  }

  public async getAccount (params: Stripe.AccountRetrieveParams): Promise<Stripe.Account> {
    return await this.sdk.accounts.retrieve(params)
  }

  public async getBankAccounts (accountId: string): Promise<Array<Stripe.BankAccount | Stripe.Card>> {
    const result = await this.sdk.accounts.listExternalAccounts(accountId, {
      object: 'bank_account',
      limit: 1
    })

    return result.data
  }

  public async getCards (accountId: string): Promise<Array<Stripe.BankAccount | Stripe.Card>> {
    const result = await this.sdk.accounts.listExternalAccounts(accountId, {
      object: 'card',
      limit: 1
    })

    return result.data
  }

  public async getCharge (chargeId: string): Promise<Stripe.Charge> {
    const result = await this.sdk.charges.retrieve(chargeId)
    return result
  }

  public async getTransaction (txnId: string): Promise<Stripe.BalanceTransaction> {
    const result = await this.sdk.balanceTransactions.retrieve(txnId)
    return result
  }

  public async getLoginLink (accountId: string): Promise<Stripe.LoginLink> {
    return await this.sdk.accounts.createLoginLink(accountId)
  }

  public async getBalance (accountId: string): Promise<Stripe.Balance> {
    return await this.sdk.balance.retrieve({
      stripeAccount: accountId
    })
  }
}