import * as http from 'http'
import * as https from 'https'
import { parse } from 'url'
import { env } from 'process'
import next from 'next'

import { init } from '@/lib/alice'
import createSecureContext from '@/lib/createSecureContext'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const callback = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const parsedUrl = parse(req.url as string, true)

  handle(req, res, parsedUrl)
}

app.prepare().then(async () => {
  await init()

  if (env.KEY || env.CERT) {
    const port = env.HTTPS || 443

    https.createServer({
      SNICallback: async (servername, cb) => {
        cb(null, await createSecureContext(servername))
      },
      key: env.KEY,
      cert: env.CERT
    }, callback).listen(port, () => {
      console.log(`🚀  Server ready at https://localhost:${port}`)
    })
  }

  const port = env.HTTP || 80

  http.createServer(callback).listen(port, () => {
    console.log(`🚀  Server ready at http://localhost:${port}`)
  })
})
