import { Schema, Document } from 'mongoose'

import createConnection from '@/lib/createConnection'

const alice = createConnection('alice')

interface Env extends Document {}

const EnvModel = new Schema<Env>({})

export default alice.model<Env>('env', EnvModel)
