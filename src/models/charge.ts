import { Schema, Types, model } from "mongoose"


const chargeSchema = new Schema({
  amount: {
    required: true,
    type: Types.Decimal128,
  },
  outTradeNo: {
    required: true,
    type: String
  },
  tradeNo: {
    required: false,
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  currency: {
    type: String,
    required: true,
  },
  channel: {
    type: String,
    required: true,
  }
})


export const chargeModel = model('Charge', chargeSchema)