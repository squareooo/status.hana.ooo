import { AuthenticationError } from 'apollo-server-core'
import MUUID from 'uuid-mongodb'

import Series from '@/models/series'

export const createSeries = async (
  _: any,
  args: { input: any },
  { payload }: any
): Promise<any> => {
  try {
    if (payload == null) return new AuthenticationError('')

    const series = new Series({
      ...args.input,
      userId: MUUID.from(payload.sub)
    })

    return await series.save()
  } catch (err) {
    console.error(err)
  }
}
