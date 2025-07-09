import { NextFunction, Request, Response } from 'express'
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
    if (order.status === 'paid') {
      await trigger('charge.succeeded', {
        amount: order.usdcents / 100,
        tradeNo: order.id,
        outTradeNo: order.id,
        currency: CurrencyCode.USD,
        provider: 'peropay',
        name: 'charge.succeeded',
      })

      if (res.locals.dbUsed) {
        const event = new EventModel({
          outTradeNo: order.id,
          tradeNo: order.id,
          name: 'charge.succeeded',
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
