import { Schema, Document } from 'mongoose'
import { Binary } from 'mongodb'
import MUUID from 'uuid-mongodb'

import createConnection from '@/lib/createConnection'

const test = createConnection('test')

interface Test extends Document {
  id: string | Binary
  userId: string | Binary
  name: string
  publishedAt?: Date
}

const TestModel = new Schema(
  {
    id: {
      type: Object,
      default: MUUID.v4,
      required: true,
      unique: true
    },
    userId: {
      type: Object,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    publishedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

export default test.model<Test>('test', TestModel)
