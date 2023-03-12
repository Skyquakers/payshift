import { Schema, Types, Model } from "mongoose"


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
  }
})


export const chargeModel = new Model('Charge', chargeSchema)