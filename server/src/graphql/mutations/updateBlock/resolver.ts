import { AuthenticationError } from 'apollo-server-core'
import MUUID from 'uuid-mongodb'

import Block from '@/models/block'

export const updateBlock = async (
  _: any,
  args: { input: any },
  { payload }: any
): Promise<any> => {
  try {
    if (payload == null) return new AuthenticationError('')

    const id = args.input.id.replace(
      /(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/,
      '$1-$2-$3-$4-$5'
    )

    const block = await Block.findOneAndUpdate(
      {
        id: MUUID.from(id)
      },
      {
        index: args.input.index,
        markdown: args.input.markdown
      },
      {
        new: true
      }
    )
    if (block == null) return

    block.id = MUUID.from(block.id).toString('N')

    return block
  } catch (err) {
    console.error(err)
  }
}
