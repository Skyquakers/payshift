import type { ChargeCreateParams, IPaymentProvidable, PayshiftProviderName } from "../common";
import { type EPayPaymentResult, EPayProvider } from "./epay";


export class EPayClusterProvider implements IPaymentProvidable {
  public name: PayshiftProviderName = 'epay_cluster'
  public providers: EPayProvider[]

  constructor (providers: EPayProvider[]) {
    this.providers = providers
  }

  public async createPayment (
    charge: ChargeCreateParams,
    notifyUrl?: string): Promise<Pick<EPayPaymentResult, 'payurl' | 'qrcode' | 'urlscheme'>> {
    const provider = this.providers[Math.floor(Math.random() * this.providers.length)]
    console.log('use epay provider', provider.endpoint)
    return await provider.createPayment(charge, notifyUrl)
  }
}