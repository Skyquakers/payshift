import { trigger } from "../event-handler"

export const onAlipayChargeSucceeded = async function (object: PayshiftEvent) {
  trigger(PayshiftEventName.ChargeSucceeded, object)
}