import { Schema, Types, Model } from "mongoose"


const eventSchema = new Schema({
  amount: {
    required: true,
    type: Types.Decimal128,
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
    enum: PayshiftEventName,
    required: true
  },
  settled: {
    type: Boolean,
    default: false,
  }
})


export const EventModel = new Model('Event', eventSchema)