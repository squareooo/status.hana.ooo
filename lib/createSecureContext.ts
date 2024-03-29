import { env } from 'process'
import * as tls from 'tls'

const createSecureContext = async (servername: string) => {
  return tls.createSecureContext({
    key: env.KEY,
    cert: env.CERT
  })
}

export default createSecureContext
