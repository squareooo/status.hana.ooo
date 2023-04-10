import { AuthenticationError } from 'apollo-server-core'
import MUUID from 'uuid-mongodb'

import Block from '@/models/block'

export const deleteBlock = async (
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

    const deletedBlock = await Block.findOneAndDelete(
      {
        id: MUUID.from(id),
        userId: MUUID.from(payload.sub)
      }
    )
    if (deletedBlock == null) return

    deletedBlock.id = MUUID.from(deletedBlock.id).toString('N')

    return deletedBlock
  } catch (err) {
    console.error(err)
  }
}
