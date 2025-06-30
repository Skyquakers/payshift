import bodyParser from 'body-parser'
import { Router } from 'express'
import { onAlipayEvent } from '../controllers/webhook-alipay'
import { onCCBillEvent } from '../controllers/webhook-ccbill'
import { onEPayEvent } from '../controllers/webhook-epay'
import { onFakaEvent } from '../controllers/webhook-faka'
import { onStripeEvent } from '../controllers/webhook-stripe'
import { onWechatPayEvent } from '../controllers/webhook-wechatpay'

export const router: Router = Router()

router.post(
  '/alipay',
  bodyParser.urlencoded({ extended: false }),
  onAlipayEvent
)
router.post(
  '/wechat_pay',
  bodyParser.raw({ type: 'application/json' }),
  onWechatPayEvent
)
router.post(
  '/stripe',
  bodyParser.raw({ type: 'application/json' }),
  onStripeEvent
)
router.get('/epay', onEPayEvent)
router.post('/faka', bodyParser.raw({ type: 'application/json' }), onFakaEvent)
router.post(
  '/ccbill',
  bodyParser.raw({ type: 'application/json' }),
  onCCBillEvent
)
