import AlipaySdk from "alipay-sdk"
import { NextFunction, Request, Response } from "express"
import { trigger } from "../event-handler"
import { EventModel } from "../models/event"
import { CurrencyCode } from "../currency"
import { PayshiftEventName } from '../common'


type AlipayNotifyStatus = 'TRADE_SUCCESS' | 'TRADE_FINISHED' | 'WAIT_BUYER_PAY' | 'TRADE_CLOSED'


// https://opendocs.alipay.com/open/203/105286
// https://opendocs.alipay.com/support/01raw4
export const onAlipayEvent = async function (req: Request, res: Response, next: NextFunction) {
  console.log('onAlipayEvent')
  try {
    const sdk = res.locals.alipay?.sdk as AlipaySdk
    try {
      const ok = sdk.checkNotifySign(req.body)
      if (!ok) {
        throw new Error('notify post data verify failed')
      }
    } catch (err) {
      console.error(err)
      return res.send('fail')
    }

    let settled = false
    let name: PayshiftEventName = 'charge.failed'
  
    const data = req.body

    const {
      total_amount,
      trade_no,
      out_trade_no,
      subject } = data
    const status = data.trade_status as AlipayNotifyStatus

    const amount = Number(total_amount) * 100

    if (['TRADE_SUCCESS', 'TRADE_FINISHED'].includes(status)) {
      name = 'charge.succeeded'
      settled = true

      await trigger(name, {
        amount,
        tradeNo: trade_no,
        outTradeNo: out_trade_no,
        title: subject,
        currency: CurrencyCode.CNY,
        provider: 'alipay',
        name,
      })
    }

    if (res.locals.dbUsed) {
      const event = new EventModel({
        settled,
        outTradeNo: out_trade_no,
        name,
        tradeNo: trade_no,
        amount,
      })
      await event.save() 
    }

    res.status(200).send('success')
  } catch (err) {
    console.log('error occured in alipay event:')
    console.error(err)
    res.status(500).send('fail')
  }
}