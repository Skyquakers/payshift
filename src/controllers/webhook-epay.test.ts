import type { Server } from 'node:http'
import express from 'express'
import { describe, expect, test } from 'vitest'
import type { PayshiftEvent } from '../event-handler'
import { register, unregister } from '../event-handler'
import { router } from '../routes/webhook'

const startWebhookServer = async () => {
  const app = express()
  app.use('/webhooks', router)

  return await new Promise<Server>((resolve) => {
    const server = app.listen(0, () => {
      resolve(server)
    })
  })
}

const closeServer = async (server: Server) => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err)
        return
      }

      resolve()
    })
  })
}

const getServerBaseUrl = (server: Server) => {
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('test server did not bind to a TCP port')
  }

  return `http://127.0.0.1:${address.port}`
}

const registerCapture = (events: PayshiftEvent[]) => {
  const onSucceeded = async (event: PayshiftEvent) => {
    events.push(event)
  }

  register('charge.succeeded', onSucceeded)

  return () => {
    unregister('charge.succeeded', onSucceeded)
  }
}

describe('EPay Webhooks', function () {
  test('accepts documented GET callback without param', async function () {
    const events: PayshiftEvent[] = []
    const cleanup = registerCapture(events)
    const server = await startWebhookServer()

    try {
      const url = new URL('/webhooks/epay', getServerBaseUrl(server))
      url.searchParams.set('pid', '102830944611328')
      url.searchParams.set('trade_no', 'X2069733050232999936')
      url.searchParams.set('out_trade_no', '6a3bb4baa8cbbf227b1730af')
      url.searchParams.set('type', 'wxpay')
      url.searchParams.set('name', 'giftcard o 6a3bb4baa8cbbf227b1730af')
      url.searchParams.set('money', '20.48')
      url.searchParams.set('trade_status', 'TRADE_SUCCESS')
      url.searchParams.set('sign', 'd5b8e12f9e391a1cd48257ac117b873a')
      url.searchParams.set('sign_type', 'MD5')

      const response = await fetch(url)

      expect(response.status).toBe(200)
      expect(await response.text()).toBe('success')
      expect(events).toHaveLength(1)
      expect(events[0]?.outTradeNo).toBe('6a3bb4baa8cbbf227b1730af')
      expect(events[0]?.amount).toBe(2048)
      expect(events[0]?.tradeNo).toBe('X2069733050232999936')
    } finally {
      cleanup()
      await closeServer(server)
    }
  })
})
