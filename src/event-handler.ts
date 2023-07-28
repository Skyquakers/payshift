import { PayshiftEventName, PayshiftProviderName } from "./common"
import { CurrencyCode } from "./currency"

export const callbacks:  Map<string, Function[]> = new Map()

type PayshiftEvent = {
  amount?: number, // in cents
  title?: string,
  outTradeNo?: string,
  tradeNo?: string,
  provider: PayshiftProviderName,
  name: PayshiftEventName,
  currency?: CurrencyCode,
  accountId?: string,
}


export const register = function (event: PayshiftEventName, callback: Function) {
  const fns = callbacks.get(event)
  if (fns) {
    fns.push(callback)
  } else {
    callbacks.set(event, [callback])
  }
}


export const trigger = async function (event: PayshiftEventName, object: PayshiftEvent, ...args: any[]) {
  const fns = callbacks.get(event)
  if (fns) {
    const promises: Promise<void>[] = []
    fns.forEach(async fn => {
      promises.push(fn.call(null, object, ...args))
    })
    await Promise.all(promises)
  }
}


export const unregister = function (event: PayshiftEventName, callback: Function) {
  const fns = callbacks.get(event)
  if (fns) {
    const index = fns.indexOf(callback)
    if (index !== -1) {
      fns.splice(index, 1)
    }
  }
}