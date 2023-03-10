

export class Payshift {
  private callbacks: Map<string, Function[]>

  static use(provider: IPaymentProvidable) {
    
  }

  constructor () {
    this.callbacks = new Map()
  }

  public on(event: string, callback: Function) {

  }
}