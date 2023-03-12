import express, { Express } from 'express'
import { router as webhookRouter } from './routes/webhook'
import { register } from './event-handler'
import mongoose from 'mongoose'

const port = 3000

export class Payshift {
  private webserver: Express
  private dbUsed: boolean

  static use(provider: IPaymentProvidable) {

  }

  constructor () {
    this.dbUsed = false
    this.webserver = express()
    this.webserver.use('/webhooks', webhookRouter)
    this.webserver.listen(port)
    console.log(`Payshift webserver start listening on ${port}`)
  }

  public on(event: PayshiftEventName, callback: Function) {
    register(event, callback)
  }

  public async usedb() {
    try {
      await mongoose.connect('mongodb://mongodb:27017/payshift')
      this.dbUsed = true
    } catch (err) {
      console.error(err)
    }
  }
}