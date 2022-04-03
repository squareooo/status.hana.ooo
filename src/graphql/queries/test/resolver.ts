import MUUID from 'uuid-mongodb'

import Test from '@/models/test'

export const test = async (
  _: any,
  args: { input: { id: string } }
): Promise<any> => {
  const id = args.input.id.replace(
    /(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/,
    '$1-$2-$3-$4-$5'
  )

  const test = await Test.findOne({ id: MUUID.from(id) })

  return test
}
