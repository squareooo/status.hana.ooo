import { Schema, Document } from 'mongoose'

import createConnection from '@/lib/createConnection'

const alice = createConnection('alice')

interface Cert extends Document {
  KEY: string;
  CERT: string;
}

const CertModel = new Schema({
  DOMAIN: {
    type: String,
    required: true
  }
})

export default alice.model<Cert>('cert', CertModel)
