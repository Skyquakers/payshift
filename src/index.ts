import express, { Express } from 'express'
import { router as webhookRouter } from './routes/webhook'
import { register } from './event'

const port = 3000

export class Payshift {
  private webserver: Express

  static use(provider: IPaymentProvidable) {

  }

  constructor () {
    this.webserver = express()
    this.webserver.use('/webhooks', webhookRouter)
    this.webserver.listen(port)
    console.log(`Payshift webserver start listening on ${port}`)
  }

  public on(event: PayshiftEventName, callback: Function) {
    register(event, callback)
  }
}