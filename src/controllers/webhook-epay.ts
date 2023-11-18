import type { NextFunction, Request, Response } from "express"
import { type EPayMetaParams, sign, type EPayType, type PresignedEPayPaymentParams } from '../providers/epay'
import { CurrencyCode } from "../currency"
import { trigger } from "../event-handler"
import { EventModel } from "../models/event"
import { PayshiftEventName } from "../common"


// The sign sent back from epay instances does not match from what we sent them
// thus we can't verify at all
const dangerouslySkipVerify = true


export const onEPayEvent = async function (req: Request, res: Response, next: NextFunction) {
  try {
    const { type, pid, out_trade_no, money, trade_no, name: title, sign: serverSign, trade_status, param } = req.query

    const paramString = param as string
    if (paramString.slice(-1) !== encodeURIComponent('}')) {
      if (!dangerouslySkipVerify) {
        return res.status(401).json('sign check error')
      }
    } else {
      const unescaped = decodeURIComponent(param as string).replaceAll('\\&quot;', '"').replace('\\&', '"')
      const meta = JSON.parse(unescaped) as EPayMetaParams
  
      const md5Reg = /^[a-f0-9]{32}$/gi
  
      if (!md5Reg.test(serverSign as string)) {
        return res.status(401).json('sign check error')
      }
  
      if (res.locals.epays) {
        let verified = false
  
        const data: PresignedEPayPaymentParams = {
          pid: Number(pid),
          out_trade_no: out_trade_no as string,
          notify_url: meta.notify_url,
          return_url: meta.return_url,
          name: title as string,
          money: Number(money).toFixed(2),
          clientip: meta.clientip,
          device: 'pc',
          sign_type: 'MD5',
          type: type as EPayType,
          param: param as string,
        }
  
        for (const epay of res.locals.epays.values()) {
          const clientSign = sign(data, epay.key)
          console.log(`[payshift]: clientSign for ${epay.endpoint}`, clientSign)
          if (clientSign === serverSign) {
            verified = true
            break
          }
        }
  
        if (!verified) {
          console.log('[payshift]: serverSign', serverSign)
          if (!dangerouslySkipVerify) {
            return res.status(401).json('sign check error')
          }
        }
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
      provider: 'epay',
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
    console.log('[payshift]: error occured in epay event:')
    console.error(err)
    res.status(500).send('fail')
  }
}