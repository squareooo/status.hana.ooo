import * as tls from 'tls'
import { env } from 'process'

import Cert from '@/models/cert'

const createSecureContext = async (servername: string) => {
  try {
    const data = await Cert.findOne({
      DOMAIN: servername
    }).lean()

    return tls.createSecureContext({
      key: data.KEY,
      cert: data.CERT
    })
  } catch {
    return tls.createSecureContext({
      key: env.KEY,
      cert: env.CERT
    })
  }
}

export default createSecureContext
