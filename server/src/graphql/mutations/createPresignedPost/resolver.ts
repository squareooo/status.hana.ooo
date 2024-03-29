import { AuthenticationError } from 'apollo-server-core'
import MUUID from 'uuid-mongodb'
import { createPresignedPost as s3PresignedPost } from '@aws-sdk/s3-presigned-post'
import mime from 'mime-types'

import { s3Client } from '@/lib/s3Client'
import Test from '@/models/test'

export const createPresignedPost = async (
  _: any,
  args: { input: { testId: string, fileName: string } },
  { payload }: { payload?: { sub: string } }
): Promise<any> => {
  try {
    if (payload == null) return new AuthenticationError('')

    const testId = args.input.testId.replace(
      /(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/,
      '$1-$2-$3-$4-$5'
    )
    const test = await Test.findOne({
      id: MUUID.from(testId),
      userId: MUUID.from(payload.sub)
    })
    if (test == null) return

    const contentType = mime.lookup(args.input.fileName)
    if (contentType === false) return

    const uuid = MUUID.from(test.id).toString('N')
    const name = MUUID.v4().toString('N')
    const extension = mime.extension(contentType) as string

    const fields = (): any => {
      if (contentType.startsWith('image/')) {
        return { 'Content-Type': contentType }
      }

      return undefined
    }

    const presignedPost = await s3PresignedPost(s3Client, {
      Bucket: process.env.AWS_BUCKET as string,
      Key: `${uuid}/${name}.${extension}`,
      Fields: fields(),
      Conditions: [['content-length-range', 0, 10485760]]
    })

    return {
      ...presignedPost,
      fields: {
        ...presignedPost.fields,
        ContentType: presignedPost.fields['Content-Type'],
        XAmzAlgorithm: presignedPost.fields['X-Amz-Algorithm'],
        XAmzCredential: presignedPost.fields['X-Amz-Credential'],
        XAmzDate: presignedPost.fields['X-Amz-Date'],
        XAmzSignature: presignedPost.fields['X-Amz-Signature']
      }
    }
  } catch (err) {
    console.error(err)
  }
}
