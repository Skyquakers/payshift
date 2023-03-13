import { Router } from "express"
import { onAlipayEvent, onStripeEvent, onWechatPayEvent } from "../controllers/webhook"


export const router = Router()

router.post('/alipay', onAlipayEvent)
      .get('/alipay', onAlipayEvent)
router.post('/wechat_pay', onWechatPayEvent)
      .get('/wechat_pay', onWechatPayEvent)
router.post('/stripe', onStripeEvent)