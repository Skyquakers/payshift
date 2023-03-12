import { Router } from "express"
import { onChargeSucceeded } from "../controllers/webhook"


export const router = Router()

router.post('/alipay', async function (req, res, next) {
  try {
    const {
      total_amount,
      trade_status,
      trade_no,
      out_trade_no,
      subject } = req.body
    if (['TRADE_SUCCESS', 'TRADE_FINISHED'].includes(trade_status)) {
      onChargeSucceeded({
        amount: total_amount,
        tradeNo: trade_no,
        outTradeNo: out_trade_no,
        title: subject,
      })
    }

    res.send('success')
  } catch (err) {
    res.send('fail')
  }
})

router.post('/wechat_pay', async function (req, res, next) {
  
})

router.post('/stripe', async function (req, res, next) {
  
})