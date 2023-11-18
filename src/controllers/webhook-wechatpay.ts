import WxPay from 'wechatpay-node-v3'
import { NextFunction, Request, Response } from "express"
import { trigger } from "../event-handler"
import { EventModel } from "../models/event"
import { PayshiftEventName } from '../common'
import { WechatPayProvider } from '../providers/wechat-pay'


// https://pay.weixin.qq.com/wiki/doc/api_external/ch/apis/chapter3_3_11.shtml
export const onWechatPayEvent = async function (req: Request, res: Response, next: NextFunction) {
  console.log('[payshift]: onWechatPayEvent')
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

    const provider = res.locals.wechatPay as WechatPayProvider
    const sdk = provider.sdk as WxPay
    const {
      ciphertext,
      associated_data,
      nonce,
    } = resource
    const result = sdk.decipher_gcm(ciphertext, associated_data, nonce, provider.apiKey)
    const {
      trade_state,
      out_trade_no,
      amount,
      service_introduction,
      transaction_id,
    } = result as any
    let settled = false
    let name: PayshiftEventName = 'charge.created'

    if (trade_state === 'SUCCESS') {
      settled = true
      name = 'charge.succeeded'
      await trigger(name, {
        amount: amount.total,
        tradeNo: transaction_id,
        outTradeNo: out_trade_no,
        title: service_introduction,
        currency: amount.currency,
        provider: 'wechat_pay',
        name,
      })
    }

    if (res.locals.dbUsed) {
      const event = new EventModel({
        settled,
        outTradeNo: out_trade_no,
        name,
        tradeNo: transaction_id,
        amount: Number.parseInt(amount.total, 10)
      })
      await event.save() 
    }

    return res.status(200).json({
      code: 'SUCCESS',
    })
  } catch (err) {
    console.log('[payshift]: error occured in wechat event:')
    console.error(err)
    return res.status(500).json({
      code: 'FAIL',
      message: '你把服务器整不会了'
    })
  }
}