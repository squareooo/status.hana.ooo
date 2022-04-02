import { AuthenticationError } from 'apollo-server-koa'
import MUUID from 'uuid-mongodb'

import Test from '@/models/test'

export const createTest = async (
  _: any,
  args: { input: any },
  { payload }: any
): Promise<any> => {
  try {
    if (payload == null) return new AuthenticationError('')

    const test = await new Test({
      ...args.input,
      userId: MUUID.from(payload.sub),
      publishedAt: args.input.published === true ? new Date() : args.input.publishedAt
    }).save()

    test.id = MUUID.from(test.id).toString('N')

    return test
  } catch (err) {
    console.error(err)
  }
}
