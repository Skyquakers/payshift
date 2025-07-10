import { NextFunction, Request, Response } from 'express'
import { PayshiftEventName } from '../common'
import { CurrencyCode } from '../currency'
import { trigger } from '../event-handler'
import { EventModel } from '../models/event'
import { PeropayOrder } from '../providers/peropay'

export const onPeropayEvent = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const order: PeropayOrder = req.body
    const eventName: PayshiftEventName = 'charge.succeeded'
    if (order.status === 'paid') {
      await trigger(eventName, {
        amount: order.usdcents,
        tradeNo: order.id,
        outTradeNo: order.outTradeNo,
        currency: CurrencyCode.USD,
        provider: 'peropay',
        name: eventName,
      })

      if (res.locals.dbUsed) {
        const event = new EventModel({
          outTradeNo: order.outTradeNo,
          tradeNo: order.id,
          name: eventName,
          currency: CurrencyCode.USD,
          provider: 'peropay',
          title: 'Peropay Payment',
        })

        await event.save()
      }

      return res.status(200).send('success')
    }
  } catch (err) {
    console.log('[payshift]: error occured in peropay event:')
    console.error(err)
    res.status(500).send('fail')
  }
}
