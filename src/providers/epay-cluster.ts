import type { ChargeCreateParams, IPaymentProvidable, PayshiftProviderName } from "../common";
import { type EPayPaymentResult, EPayProvider } from "./epay";


export class EPayClusterProvider implements IPaymentProvidable {
  public name: PayshiftProviderName = 'epay_cluster'
  public providers: EPayProvider[]
  private readonly roundrobinMax: number
  private roundrobin: number

  constructor (providers: EPayProvider[]) {
    this.providers = providers
    this.roundrobinMax = providers.length
    this.roundrobin = 0
  }

  public async createPayment (
    charge: ChargeCreateParams,
    notifyUrl?: string): Promise<Pick<EPayPaymentResult, 'payurl' | 'qrcode' | 'urlscheme'>> {
    const provider = this.providers[this.roundrobin]
    this.roundrobin += 1
    this.roundrobin %= this.roundrobinMax
    console.log('use epay provider', provider.endpoint)
    return await provider.createPayment(charge, notifyUrl)
  }
}