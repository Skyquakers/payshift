import express, { Express } from 'express'
import { router as webhookRouter } from './routes/webhook'
import { register, unregister } from './event-handler'
import mongoose, { SchemaTypes, Types } from 'mongoose'
import { AlipayProvider, StripeProvider, WechatPayProvider } from './index'
import { chargeModel } from './models/charge'


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

  private getProvider(name: PayshiftProviderName): IPaymentProvidable | null {
    for (const provider of this.providers.values()) {
      if (provider.name === name) {
        return provider
      }
    }

    return null
  }

  public async usedb(connectionString: string = 'mongodb://mongodb:27017/payshift') {
    try {
      console.log('starting connecting to mongodb')
      await mongoose.connect(connectionString)
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

  public on(event: PayshiftEventName, callback: Function) {
    if (!this.webServerStarted) {
      throw new Error('start web server then you can register events, call payshift.startWebServer()')
    }

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
    }

    if (this.dbUsed) {
      const chargeObjectCopy = JSON.parse(JSON.stringify(chargeObj))
      chargeObjectCopy.amount = new SchemaTypes.Decimal128(String(chargeObjectCopy.amount))
      const charge = new chargeModel(chargeObjectCopy)
      await charge.save()
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
        data: paymentIntent.client_secret
      }
    } else if (chargeObj.channel === 'alipay_web') {
      const provider = this.getProvider('alipay') as AlipayProvider
      const url = await provider.createDesktopPaymentLink(params)
      return {
        charge: chargeObj,
        data: url
      }
    } else if (chargeObj.channel === 'alipay_mobile_web') {
      const provider = this.getProvider('alipay') as AlipayProvider
      const url = await provider.createMobilePaymentLink(params)
      return {
        charge: chargeObj,
        data: url
      }
    } else if (chargeObj.channel === 'wechat_mobile_web') {
      const provider = this.getProvider('wechat_pay') as WechatPayProvider
      const url = await provider.createMobilePaymentLink(params, `${this.hostname}/webhooks/wechat_pay`)
      return {
        charge: chargeObj,
        data: url
      }
    } else if (chargeObj.channel === 'wechat_qrcode') {
      const provider = this.getProvider('wechat_pay') as WechatPayProvider
      const url = await provider.createPaymentQrcodeUrl(params, `${this.hostname}/webhooks/wechat_pay`)
      return {
        charge: chargeObj,
        data: url
      }
    }

    throw new Error(`unknown channel ${chargeObj.channel}`)
  }
}