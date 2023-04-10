import { NextFunction, Request, Response } from "express"
import Stripe from "stripe"
import { trigger } from "../event-handler"


export const onStripeEvent = async function (req: Request, res: Response, next: NextFunction) {
  const sig = req.headers['stripe-signature'] as string
  const sdk = res.locals.stripe?.sdk as Stripe
  let event

  try {
    event = await sdk.webhooks.constructEventAsync(req.body, sig, res.locals.endpointSecret)
  } catch (err) {
    let message = ''
    if (err instanceof Error) {
      message = `Webhook Error: ${err.message}`
    } else {
      message = 'Webhook Error, unknown error'
    }
    console.error(err)
    return res.status(400).send(message)
  }

  try {
    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account
      if (account.payouts_enabled) {
        trigger('account.updated', {
          name: 'account.updated',
          accountId: account.id,
          provider: 'stripe',
        })
      }
    } else if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      trigger('payment_intent.succeeded', {
        name: 'payment_intent.succeeded',
        provider: 'stripe',
      }, paymentIntent)
    } else {
      console.log(event.type)
      console.log(event.data)
    }
  } catch (err: any) {
    if (err instanceof Error) {
      return res.status(400).send(err.message)      
    }

    return res.status(400).json(err)
  }


  res.json({
    received: true
  })
}