import { Schema, Document } from 'mongoose'
import { Binary } from 'mongodb'

import createConnection from '@/lib/createConnection'

const test = createConnection('test')

interface User extends Document {
  id: string | Binary
  username: string
  name: string
  desc?: string
}

const UserModel = new Schema(
  {
    id: {
      type: Object,
      required: true,
      unique: true
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    desc: {
      type: String
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

export default test.model<User>('user', UserModel)
