import { trigger } from "../event"

export const onChargeSucceeded = function (object: PayshiftEvent) {
  trigger(PayshiftEventName.ChargeSucceeded, object)
}