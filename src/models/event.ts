import { Model, Schema, model, models } from "mongoose"
import { PayshiftEvent } from "../event-handler"

const eventSchema = new Schema<PayshiftEvent>({
  amount: {
    required: true,
    type: Number,
  },
  outTradeNo: {
    required: true,
    type: String
  },
  tradeNo: {
    required: true,
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  settled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Number,
    required: false,
    default: Date.now
  }
})


export const EventModel: Model<PayshiftEvent> =
  models.Event || model('Event', eventSchema)