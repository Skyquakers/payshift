import { Router } from "express"
import { onAlipayEvent } from "../controllers/webhook-alipay"
import { onWechatPayEvent } from "../controllers/webhook-wechatpay"
import { onStripeEvent } from "../controllers/webhook-stripe"
import bodyParser from "body-parser"


export const router: Router = Router()

router.post('/alipay', bodyParser.raw({ type: 'application/json' }), onAlipayEvent)
router.post('/wechat_pay', bodyParser.raw({ type: 'application/json' }), onWechatPayEvent)
router.post('/stripe', bodyParser.raw({ type: 'application/json' }), onStripeEvent)