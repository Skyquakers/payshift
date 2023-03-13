import AlipaySdk from "alipay-sdk"
import WxPay from 'wechatpay-node-v3'
import { NextFunction, Request, Response } from "express"
import { Types } from "mongoose"
import { trigger } from "../event-handler"
import { EventModel } from "../models/event"
import { apiKey } from "../configs/wechat-pay"
import { CurrencyCode } from "../currency"


type AlipayNotifyStatus = 'TRADE_SUCCESS' | 'TRADE_FINISHED' | 'WAIT_BUYER_PAY' | 'TRADE_CLOSED'
type WehcatNotifyStatus = 'PAYSCORE.USER_OPEN_SERVICE' | 'PAYSCORE.USER_CLOSE_SERVICE' |
  'PAYSCORE.USER_CONFIRM' | 'PAYSCORE.USER_PAID'


// https://opendocs.alipay.com/open/203/105286
// https://opendocs.alipay.com/support/01raw4
export const onAlipayEvent = async function (req: Request, res: Response, next: NextFunction) {
  try {
    const sdk = res.locals.alipay?.sdk as AlipaySdk
    try {
      const ok = sdk.checkNotifySign(req.body ?? req.query)
      if (!ok) {
        throw new Error('notify post data verify failed')
      }
    } catch (err) {
      return res.send('fail')
    }

    let settled = false
    let name: PayshiftEventName = 'charge.failed'
  
    const data = req.body ?? req.query

    const {
      total_amount,
      trade_no,
      out_trade_no,
      subject } = data
    const status = data.trade_status as AlipayNotifyStatus

    if (['TRADE_SUCCESS', 'TRADE_FINISHED'].includes(status)) {
      name = 'charge.succeeded'
      settled = true

      trigger(name, {
        amount: total_amount,
        tradeNo: trade_no,
        outTradeNo: out_trade_no,
        title: subject,
        currency: CurrencyCode.CNY,
        provider: 'alipay'
      })
    }

    const event = new EventModel({
      settled,
      outTradeNo: out_trade_no,
      name,
      tradeNo: trade_no,
      amount: new Types.Decimal128(total_amount)
    })
    await event.save()

    res.send('success')
  } catch (err) {
    console.error(err)
    res.send('fail')
  }
}


// https://pay.weixin.qq.com/wiki/doc/api_external/ch/apis/chapter3_3_11.shtml
export const onWechatPayEvent = async function (req: Request, res: Response, next: NextFunction) {
  try {
    const {
      event_type,
      resource,
      create_time,
      resource_type,
      summary,
    } = req.body ?? req.query
    if (!resource) {
      return res.status(401).json({
        code: 'FAIL',
        message: '格式错误'
      })
    }

    const sdk = res.locals.wechatPay?.sdk as WxPay
    const {
      ciphertext,
      associated_data,
      nonce,
    } = resource
    const result = sdk.decipher_gcm(ciphertext, associated_data, nonce, apiKey)
    const {
      trade_status,
      out_trade_no,
      amount,
      service_introduction,
      id,
    } = result as any
    let settled = false
    let name: PayshiftEventName = 'charge.created'

    if (trade_status === 'SUCCESS') {
      settled = true
      name = 'charge.succeeded'
      trigger(name, {
        amount: amount.payer_total,
        tradeNo: id,
        outTradeNo: out_trade_no,
        title: service_introduction,
        currency: amount.payer_currency,
        provider: 'alipay'
      })
    }

    const event = new EventModel({
      settled,
      outTradeNo: out_trade_no,
      name,
      tradeNo: id,
      amount: new Types.Decimal128(String(amount.payer_total))
    })
    await event.save()

    return res.status(200).json({
      code: 'SUCCESS',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      code: 'FAIL',
      message: '你把服务器整崩溃了'
    })
  }
}


export const onStripeEvent = async function (req: Request, res: Response, next: NextFunction) {
  res.send('fail')
}