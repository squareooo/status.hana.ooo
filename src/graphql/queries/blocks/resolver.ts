import { Types } from 'mongoose'
import MUUID from 'uuid-mongodb'

import Block from '@/models/block'

export const blocks = async (_: any, { input }: any): Promise<any> => {
  const testId = input.testId?.replace(
    /(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/,
    '$1-$2-$3-$4-$5'
  )

  const aggregates: any = []
  if (testId != null) {
    aggregates.push({ $match: { testId: MUUID.from(testId) } })
  }

  const edges: any = []
  if (input.after != null) {
    edges.push({ $match: { _id: { $lt: new Types.ObjectId(input.after) } } })
  } else if (input.before != null) {
    edges.push({ $match: { _id: { $gt: new Types.ObjectId(input.before) } } })
  }

  const sort = (number: number): any => ({
    $sort: {
      createdAt: number
    }
  })
  if (input.first != null) {
    edges.push(sort(-1), { $limit: input.first })
  } else if (input.last != null) {
    edges.push(sort(1), { $limit: input.last }, sort(-1))
  } else {
    edges.push(sort(-1))
  }

  const blocks = await Block.aggregate(
    [
      ...aggregates,
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          edges: edges,
          hasNextPage: [sort(-1), { $limit: 1 }],
          hasPreviousPage: [sort(1), { $limit: 1 }, sort(-1)]
        }
      },
      {
        $addFields: {
          totalCount: { $first: '$totalCount.count' },
          edges: {
            $map: {
              input: '$edges',
              in: { cursor: '$$this._id', node: '$$this' }
            }
          },
          pageInfo: {
            hasNextPage: {
              $and: [
                { $last: '$edges._id' },
                {
                  $ne: [
                    { $last: '$hasPreviousPage._id' },
                    { $last: '$edges._id' }
                  ]
                }
              ]
            },
            hasPreviousPage: {
              $and: [
                { $first: '$edges._id' },
                {
                  $ne: [
                    { $first: '$hasNextPage._id' },
                    { $first: '$edges._id' }
                  ]
                }
              ]
            },
            startCursor: { $first: '$edges._id' },
            endCursor: { $last: '$edges._id' }
          }
        }
      }
    ],
    {
      allowDiskUse: true
    }
  )

  return blocks.shift()
}
