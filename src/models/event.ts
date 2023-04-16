import { Schema, Types, model } from "mongoose"


const eventSchema = new Schema({
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
  }
})


export const EventModel = model('Event', eventSchema)