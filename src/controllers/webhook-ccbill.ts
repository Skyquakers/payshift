import { NextFunction, Request, Response } from "express"
import { trigger } from "../event-handler"
import { converNumberToCurrencyCode } from "../utils"
import { CurrencyCode } from "../currency"
import { createHash } from "crypto"


type CCBillEventType = 'NewSaleSuccess'

export const onCCBillEvent = async function (req: Request, res: Response, next: NextFunction) {
  console.log('[payshift]: onCCBillEvent')
  try {
    const ccbill = res.locals.ccbill
    if (!ccbill) {
      throw new Error('ccbill provider not configured')
    }
    const { transactionId, dynamicPricingValidationDigest, outTradeNo, billedCurrencyCode, billedInitialPrice, subscriptionId, title } = req.body
    const hash = createHash('md5').update(`${subscriptionId}${1}${ccbill.salt}`).digest('hex')

    if (hash !== dynamicPricingValidationDigest) {
      throw new Error('dynamicPricingValidationDigest mismatched')
    }

    const eventType: CCBillEventType = req.body.eventType

    const currency = converNumberToCurrencyCode(Number(billedCurrencyCode))

    if (eventType === 'NewSaleSuccess') {
      await trigger('charge.succeeded', {
        amount: currency === CurrencyCode.JPY ? Math.round(Number(billedInitialPrice)) : Math.round(Number(billedInitialPrice) * 100),
        tradeNo: transactionId,
        outTradeNo,
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