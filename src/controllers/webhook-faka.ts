import { NextFunction, Request, Response } from "express"
import { trigger } from "../event-handler"
import { EventModel } from "../models/event"
import { PayshiftEventName } from "../common"
import { createHash } from "crypto"


export const onFakaEvent = async function (req: Request, res: Response, next: NextFunction) {
  try {
    const { outTradeNo, merchantKeyHash, tradeNo, currency, title, amount } = req.body
    const name: PayshiftEventName = 'charge.succeeded'

    const faka = res.locals.faka

    if (!faka) {
      throw new Error('no faka in res.locals')
    }

    const keyHash = createHash('md5').update(`${outTradeNo}${faka.key}`).digest('hex')

    if (keyHash !== merchantKeyHash) {
      return res.status(401).send('mismatch')
    }

    await trigger(name, {
      amount,
      tradeNo,
      outTradeNo,
      title,
      currency,
      provider: 'order2faka',
      name,
    })

    if (res.locals.dbUsed) {
      const event = new EventModel({
        outTradeNo,
        tradeNo,
        name,
        currency,
        provider: 'order2faka',
        title,
      })

      await event.save()
    }

    return res.status(200).send('success')
  } catch (err) {
    console.log('error occured in faka event:')
    console.error(err)
    res.status(500).send('fail')
  }
}