import { Model, Schema, model, models } from "mongoose"

interface Charge {
  amount: number
  outTradeNo: string
  tradeNo?: string
  title: string
  description?: string
  currency: string
  channel: string
  clientIp?: string
  createdAt?: Date
}

const chargeSchema = new Schema({
  amount: {
    required: true,
    type: Number,
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
  },
  clientIp: {
    type: String,
    required: false,
    default: '127.0.0.1'
  },
  createdAt: {
    type: Number,
    required: false,
    default: Date.now
  }
})

export const ChargeModel: Model<Charge> =
  models.Charge || model('Charge', chargeSchema)