import { Router } from "express"
import { onAlipayChargeSucceeded } from "../controllers/webhook"
import { EventModel } from "../models/event"
import { Types } from 'mongoose'

export const router = Router()

router.post('/alipay', async function (req, res, next) {
  try {
    let settled = false
    let name = PayshiftEventName.ChargeFailed

    const {
      total_amount,
      trade_status,
      trade_no,
      out_trade_no,
      subject } = req.body      
    if (['TRADE_SUCCESS', 'TRADE_FINISHED'].includes(trade_status)) {
      onAlipayChargeSucceeded({
        amount: total_amount,
        tradeNo: trade_no,
        outTradeNo: out_trade_no,
        title: subject,
      })

      name = PayshiftEventName.ChargeCreated
      settled = true
    }

    const event = new EventModel({
      settled,
      outTradeNo: out_trade_no,
      name,
      tradeNo: trade_no,
      amount: new Types.Decimal128(total_amount)
    })
    await event.save()

    res.send('success')
    settled = true
  } catch (err) {
    res.send('fail')
  }
})

router.post('/wechat_pay', async function (req, res, next) {
  
})

router.post('/stripe', async function (req, res, next) {
  
})