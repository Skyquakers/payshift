import express, { Express } from 'express'
import { router as webhookRouter } from './routes/webhook'
import { register } from './event-handler'
import mongoose from 'mongoose'

export class Payshift {
  public webserver: Express
  private dbUsed: boolean
  private providers: IPaymentProvidable[]
  private webServerStarted: boolean
  private stripeEndpointSecret?: string

  constructor (providers: IPaymentProvidable[] = [], options: PayshiftOptions = {}) {
    this.providers = providers
    this.dbUsed = false
    this.webserver = express()
    this.webServerStarted = false
    this.stripeEndpointSecret = options.stripeEndpointSecret
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
}