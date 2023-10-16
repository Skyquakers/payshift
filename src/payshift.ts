import express, { Express } from 'express'
import { router as webhookRouter } from './routes/webhook'
import { type PayshiftEvent, register, unregister } from './event-handler'
import mongoose from 'mongoose'
import { AlipayProvider, EPayProvider, StripeProvider, WechatPayProvider } from './index'
import { chargeModel } from './models/charge'
import {
  ChargeCreateParams, ChargeObject, ChargeResponse,
  IPaymentProvidable, PayshiftEventName, PayshiftOptions,
  PayshiftProviderName } from './common'
import { EPayClusterProvider } from './providers/epay-cluster'


export class Payshift {
  public webserver: Express
  private dbUsed: boolean
  private providers: IPaymentProvidable[]
  private webServerStarted: boolean
  private stripeEndpointSecret?: string
  private hostname?: string

  constructor (providers: IPaymentProvidable[] = [], options: PayshiftOptions = {}) {
    this.providers = providers
    this.dbUsed = false
    this.webserver = express()
    this.webServerStarted = false
    this.stripeEndpointSecret = options.stripeEndpointSecret
  }

  private getProvider(name: PayshiftProviderName): IPaymentProvidable {
    for (const provider of this.providers.values()) {
      if (provider.name === name) {
        return provider
      }
    }

    throw new Error(`no such provider ${name}`)
  }

  public async usedb(connectionString: string = 'mongodb://mongodb:27017/payshift', options?: mongoose.ConnectOptions) {
    try {
      console.log('starting connecting to mongodb')
      await mongoose.connect(connectionString, options)
      this.dbUsed = true
      console.log('mongodb connected')

      if (this.webServerStarted) {
        this.webserver.use(function (req, res, next) {
          res.locals.dbUsed = true
          next()
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  public async startWebServer (hostname: string, localPort: number) {
    this.hostname = hostname
    for (const provider of this.providers.values()) {
      this.webserver.use((req, res, next) => {
        if (provider.name === 'alipay') {
          res.locals.alipay = provider
        } else if (provider.name === 'stripe') {
          if (this.stripeEndpointSecret) {
            res.locals.endpointSecret = this.stripeEndpointSecret
          } else {
            throw new Error('miss stripeEndpointSecret in constructor options')
          }

          res.locals.stripe = provider
        } else if (provider.name === 'wechat_pay') {
          res.locals.wechatPay = provider
        } else if (provider.name === 'epay') {
          res.locals.epays = [provider]
        } else if (provider.name === 'epay_cluster') {
          res.locals.epays = (provider as EPayClusterProvider).providers
        }

        next()
      })
    }

    this.webserver.use('/webhooks', webhookRouter)
    this.webserver.listen(localPort)
    console.log(`Payshift web server start listening on ${localPort}`)

    this.webserver.use(function (req, res, next) {
      res.locals.hostname = hostname
      next()
    })

    this.webServerStarted = true
  }

  public on(event: PayshiftEventName, callback: (event: PayshiftEvent, ...args: any) => Promise<void>) {
    register(event, callback)
  }

  public off(event: PayshiftEventName, callback: Function) {
    unregister(event, callback)
  }

  public async createCharge (params: ChargeCreateParams): Promise<ChargeResponse> {
    const chargeObj: ChargeObject = {
      amount: params.amount,
      title: params.title,
      outTradeNo: params.outTradeNo,
      channel: params.channel,
      currency: params.currency,
      clientIp: params.clientIp,
      userAgent: params.userAgent
    }

    let chargeId: string | undefined = undefined
    if (this.dbUsed) {
      const chargeObjectCopy = JSON.parse(JSON.stringify(chargeObj))
      const charge = new chargeModel(chargeObjectCopy)
      const savedCharge = await charge.save()
      chargeId = savedCharge._id.toString()
    }

    if (chargeObj.channel === 'stripe_web') {
      const provider = this.getProvider('stripe') as StripeProvider
      const paymentIntent = await provider.createPaymentIntent({
        automatic_payment_methods: {
          enabled: true,
        },
        currency: chargeObj.currency.toLowerCase(),
        amount: params.amount,
      })

      return {
        charge: chargeObj,
        data: paymentIntent,
        chargeId,
      }
    } else if (chargeObj.channel === 'alipay_web') {
      const provider = this.getProvider('alipay') as AlipayProvider
      const url = await provider.createDesktopPaymentLink(params)
      return {
        charge: chargeObj,
        data: url,
        chargeId,
      }
    } else if (chargeObj.channel === 'alipay_mobile_web') {
      const provider = this.getProvider('alipay') as AlipayProvider
      const url = await provider.createMobilePaymentLink(params)
      return {
        charge: chargeObj,
        data: url,
        chargeId,
      }
    } else if (chargeObj.channel === 'wechat_mobile_web') {
      const provider = this.getProvider('wechat_pay') as WechatPayProvider
      const url = this.webServerStarted ? await provider.createMobilePaymentLink(params, `${this.hostname}/webhooks/wechat_pay`) :
                                          await provider.createMobilePaymentLink(params)
      return {
        charge: chargeObj,
        data: url,
        chargeId,
      }
    } else if (chargeObj.channel === 'wechat_qrcode') {
      const provider = this.getProvider('wechat_pay') as WechatPayProvider
      const url = this.webServerStarted ? await provider.createPaymentQrcodeUrl(params, `${this.hostname}/webhooks/wechat_pay`) :
                                          await provider.createPaymentQrcodeUrl(params)
      return {
        charge: chargeObj,
        data: url,
        chargeId,
      }
    } else if (chargeObj.channel === 'epay_alipay' || chargeObj.channel === 'epay_wechat_pay') {
      const provider = this.getProvider('epay') as EPayProvider
      const result = this.webServerStarted ? await provider.createPayment(params, `${this.hostname}/webhooks/epay`) :
                                             await provider.createPayment(params)
      return {
        charge: chargeObj,
        data: result,
        chargeId,
      }
    } else if (chargeObj.channel === 'epay_cluster_alipay' || chargeObj.channel === 'epay_cluster_wechat_pay') {
      const provider = this.getProvider('epay_cluster') as EPayClusterProvider
      const result = this.webServerStarted ? await provider.createPayment(params, `${this.hostname}/webhooks/epay`) :
                                             await provider.createPayment(params)
      return {
        charge: chargeObj,
        data: result,
        chargeId,
      }
    }

    throw new Error(`unknown channel ${chargeObj.channel}`)
  }
}