import { AuthenticationError } from 'apollo-server-core'
import MUUID from 'uuid-mongodb'

import Test from '@/models/test'
import Block from '@/models/block'

export const createBlock = async (
  _: any,
  args: { input: any },
  { payload }: any
): Promise<any> => {
  try {
    if (payload == null) return new AuthenticationError('')

    const testId = args.input.testId.replace(
      /(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/,
      '$1-$2-$3-$4-$5'
    )

    const test = await Test.findOne({
      id: MUUID.from(testId)
    })
    if (test == null) return

    const block = await new Block({
      ...args.input,
      testId: MUUID.from(test.id),
      userId: MUUID.from(payload.sub)
    }).save()

    block.id = MUUID.from(block.id).toString('N')

    return block
  } catch (err) {
    console.error(err)
  }
}
