import type { NextFunction, Request, Response } from "express"
import { type EPayMetaParams, sign, type EPayType } from '../providers/epay'
import { CurrencyCode } from "../currency"
import { trigger } from "../event-handler"
import { EventModel } from "../models/event"
import { PayshiftEventName } from "../common"


export const onEPayEvent = async function (req: Request, res: Response, next: NextFunction) {
  try {
    const { type, pid, out_trade_no, money, trade_no, name: title, sign: serverSign, trade_status, param } = req.query

    const meta = JSON.parse(param as string) as EPayMetaParams

    if (res.locals.epays) {
      let verified = false

      for (const epay of res.locals.epays.values()) {
        const clientSign = sign({
          pid: Number(pid),
          out_trade_no: out_trade_no as string,
          notify_url: meta.notify_url,
          name: title as string,
          money: money as string,
          clientip: meta.clientip,
          device: 'pc',
          sign_type: 'MD5',
          type: type as EPayType,
          param: JSON.stringify({
            notify_url: meta.notify_url,
            clientip: meta.clientip,
          }),
        }, epay.key)

        if (clientSign === serverSign) {
          verified = true
          break
        }
      }

      if (!verified) {
        console.log('serverSign', serverSign)
        throw new Error('sign check error')
      }
    }

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
    console.log('error occured in epay event:')
    console.error(err)
    res.status(500).send('fail')
  }
}