import * as tls from 'tls'
import { env } from 'process'

const createSecureContext = async (servername: string) => {
  return tls.createSecureContext({
    key: env.KEY,
    cert: env.CERT
  })
}

export default createSecureContext
