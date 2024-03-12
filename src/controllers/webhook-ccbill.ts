import { NextFunction, Request, Response } from "express"
import { trigger } from "../event-handler"
import { converNumberToCurrencyCode } from "../utils"
import { CurrencyCode } from "../currency"


type CCBillEventType = 'NewSaleSuccess'

export const onCCBillEvent = async function (req: Request, res: Response, next: NextFunction) {
  console.log('[payshift]: onCCBillEvent')
  try {
    if (!req.query.eventType) {
      throw new Error('eventType is required')
    }
    if (Buffer.isBuffer(req.body)) {
      req.body = JSON.parse(req.body.toString())
    }
    const ccbill = res.locals.ccbill
    if (!ccbill) {
      throw new Error('ccbill provider not configured')
    }
    const {
      transactionId, dynamicPricingValidationDigest,
      billedCurrencyCode, billedInitialPrice, title,
      initialPeriod, subscriptionInitialPrice, subscriptionCurrencyCode,
      recurringPeriod, subscriptionRecurringPrice
    } = req.body
    const hash = ccbill.generateDigest(
      subscriptionInitialPrice,
      initialPeriod,
      subscriptionCurrencyCode,
      ccbill.salt,
      subscriptionRecurringPrice,
      recurringPeriod,
    )

    if (hash !== dynamicPricingValidationDigest) {
      throw new Error(`dynamicPricingValidationDigest mismatched, expect ${hash}, got ${dynamicPricingValidationDigest}`)
    }

    const currency = converNumberToCurrencyCode(Number(billedCurrencyCode))

    const eventType = req.query.eventType as CCBillEventType

    if (eventType === 'NewSaleSuccess') {
      await trigger('charge.succeeded', {
        amount: currency === CurrencyCode.JPY ? Math.round(Number(billedInitialPrice)) : Math.round(Number(billedInitialPrice) * 100),
        tradeNo: transactionId,
        outTradeNo: req.body['X-outTradeNo'],
        title,
        currency,
        provider: 'ccbill',
        name: 'charge.succeeded',
      })
    }
    return res.status(200).send('OK')
  } catch (err: any) {
    console.log('[payshift]: error occured in ccbill event:')
    console.error(err)
    return res.status(500).send(err.message)
  }
}