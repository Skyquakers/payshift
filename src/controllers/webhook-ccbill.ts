import { NextFunction, Request, Response } from "express"
import { trigger } from "../event-handler"
import { converNumberToCurrencyCode } from "../utils"
import { CurrencyCode } from "../currency"


type CCBillEventType = 'NewSaleSuccess' | 'RenewalSuccess'

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

    const eventType = req.query.eventType as CCBillEventType
    const { transactionId, billedCurrencyCode } = req.body
    const currency = converNumberToCurrencyCode(Number(billedCurrencyCode))

    if (eventType === 'NewSaleSuccess') {
      const {
        transactionId, dynamicPricingValidationDigest,
        billedInitialPrice,
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
  
      await trigger('charge.succeeded', {
        amount: currency === CurrencyCode.JPY ? Math.round(Number(billedInitialPrice)) : Math.round(Number(billedInitialPrice) * 100),
        tradeNo: transactionId,
        outTradeNo: req.body['X-outTradeNo'],
        currency,
        provider: 'ccbill',
        name: 'charge.succeeded',
      })
    } else if (eventType === 'RenewalSuccess') {
      console.log(req.body)
      const { billedAmount } = req.body

      await trigger('invoice.paid', {
        provider: 'ccbill',
        name: 'invoice.paid',
        tradeNo: transactionId,
        amount: currency === CurrencyCode.JPY ? Math.round(Number(billedAmount)) : Math.round(Number(billedAmount) * 100),
        currency,
      })
    }
    return res.status(200).send('OK')
  } catch (err: any) {
    console.log('[payshift]: error occured in ccbill event:')
    console.error(err)
    return res.status(500).send(err.message)
  }
}