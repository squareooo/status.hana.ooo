import { Schema, Document } from 'mongoose'
import { Binary } from 'mongodb'
import MUUID from 'uuid-mongodb'

import createConnection from '@/lib/createConnection'

const test = createConnection('test')

interface Block extends Document {
  id: string | Binary
  testId: string | Binary
  userId: string | Binary
  index: number
  markdown: string
}

const BlockModel = new Schema(
  {
    id: {
      type: Object,
      default: MUUID.v4,
      required: true,
      unique: true
    },
    testId: {
      type: Object,
      required: true
    },
    userId: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    markdown: {
      type: String
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

export default test.model<Block>('block', BlockModel)
