import { trigger } from "../event-handler"

export const onChargeSucceeded = function (object: PayshiftEvent) {
  trigger(PayshiftEventName.ChargeSucceeded, object)
}