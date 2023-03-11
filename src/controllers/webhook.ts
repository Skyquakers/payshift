import { trigger } from "../event"

export const onAlipayChargeSucceeded = async function (object: PayshiftEvent) {
  trigger(PayshiftEventName.ChargeSucceeded, object)
}