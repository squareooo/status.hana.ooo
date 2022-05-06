import { AuthenticationError } from 'apollo-server-core'
import MUUID from 'uuid-mongodb'
import { ListObjectsCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'

import createConnection from '@/lib/createConnection'
import { s3Client } from '@/lib/s3Client'
import Block from '@/models/block'
import Test from '@/models/test'

const testConnection = createConnection('test')

export const deleteTest = async (
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

    const test = await Test.findOne({
      id: MUUID.from(id),
      userId: MUUID.from(payload.sub)
    })
    if (test == null) return

    const session = await testConnection.startSession()

    let deletedTest
    await session.withTransaction(async () => {
      await Block.deleteMany(
        {
          testId: test.id,
          userId: MUUID.from(payload.sub)
        },
        {
          session
        }
      )

      const listObjectsCommand = new ListObjectsCommand({
        Bucket: process.env.AWS_BUCKET,
        Prefix: `${MUUID.from(id).toString('N')}/`
      })
      const listObjects = await s3Client.send(listObjectsCommand)

      if (listObjects.Contents !== undefined) {
        const deleteObjectsCommand = new DeleteObjectsCommand({
          Bucket: process.env.AWS_BUCKET,
          Delete: {
            Objects: listObjects.Contents?.map((x) => ({
              Key: x.Key
            }))
          }
        })
        await s3Client.send(deleteObjectsCommand)
      }

      deletedTest = await Test.findOneAndDelete(
        {
          id: MUUID.from(id),
          userId: MUUID.from(payload.sub)
        },
        {
          session
        }
      )
      if (deletedTest == null) return

      deletedTest.id = MUUID.from(deletedTest.id).toString('N')
    })

    session.endSession().catch(() => {})

    return deletedTest
  } catch (err) {
    console.error(err)
  }
}
