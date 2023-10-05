import type { NextFunction, Request, Response } from "express"
import { sign } from '../providers/epay'
import { CurrencyCode } from "../currency"
import { trigger } from "../event-handler"
import { EventModel } from "../models/event"
import { PayshiftEventName } from "../common"


export const onEPayEvent = async function (req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: verify sign
    const { out_trade_no, money, trade_no, name: title, sign: serverSign, trade_status } = req.query

    let name: PayshiftEventName = 'charge.failed'
    const amount = Number(money) * 100

    if (trade_status === 'TRADE_SUCCESS') {
      name = 'charge.succeeded'
    }

    await trigger(name, {
      amount,
      tradeNo: trade_no as string,
      outTradeNo: out_trade_no as string,
      title: title as string,
      currency: CurrencyCode.CNY,
      provider: 'alipay',
      name,
    })

    if (res.locals.dbUsed) {
      const event = new EventModel({
        settled: true,
        outTradeNo: out_trade_no,
        title,
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