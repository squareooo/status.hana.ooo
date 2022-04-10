import type { NextPage } from 'next'
import React from 'react'

import {
  TestsQuery
} from '@/lib/queries/tests.graphql'

interface Props {
  data: TestsQuery;
}

const Main: NextPage<Props> = ({ data }) => {
  return (
    <>
      {data.tests.edges?.map((test) => {
        return (
          <a href={`/${test?.node.id}`}>
            <div>{test?.node.name}</div>
          </a>
        )
      })}
    </>
  )
}

export default Main
