import { NextFunction, Request, Response } from "express"
import Stripe from "stripe"
import { trigger } from "../event-handler"


export const onStripeEvent = async function (req: Request, res: Response, next: NextFunction) {
  const sig = req.headers['stripe-signature'] as string
  const sdk = res.locals.stripe?.sdk as Stripe
  let event

  try {
    if (!res.locals.endpointSecret) {
      throw new Error('no endpoint secret')
    }
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
        await trigger('account.updated', {
          name: 'account.updated',
          accountId: account.id,
          provider: 'stripe',
        })
      }
    } else if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await trigger('payment_intent.succeeded', {
        name: 'payment_intent.succeeded',
        provider: 'stripe',
      }, paymentIntent)
    } else if (event.type === 'identity.verification_session.verified' ||
               event.type === 'identity.verification_session.requires_input' ||
               event.type === 'identity.verification_session.created') {
      const session = event.data.object as Stripe.Identity.VerificationSession
      await trigger(event.type, {
        name: event.type,
        provider: 'stripe',
      }, session)
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      await trigger('customer.subscription.updated', {
        name: 'customer.subscription.updated',
        provider: 'stripe',
      }, subscription)
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      await trigger('customer.subscription.deleted', {
        name: 'customer.subscription.deleted',
        provider: 'stripe',
      }, subscription)
    } else if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice
      await trigger('invoice.paid', {
        name: 'invoice.paid',
        provider: 'stripe',
      }, invoice)
    } else if (event.type === 'invoice.finalized') {
      const invoice = event.data.object as Stripe.Invoice
      await trigger('invoice.finalized', {
        name: 'invoice.finalized',
        provider: 'stripe',
      }, invoice)
    } else if (event.type === 'payout.paid' ||
               event.type === 'payout.failed') {
      const payout = event.data.object as Stripe.Payout
      await trigger(event.type, {
        name: event.type,
        provider: 'stripe'
      }, payout)
    } else {
      console.log(event.type)
      console.log(event.data)
    }

    return res.status(200).json({
      received: true
    })
  } catch (err: any) {
    if (err instanceof Error) {
      return res.status(400).send(err.message)      
    }

    return res.status(400).json(err)
  }
}