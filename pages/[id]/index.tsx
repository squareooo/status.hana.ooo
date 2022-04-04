import { NextPage, GetServerSideProps } from 'next'

import { initializeApollo } from '@/lib/apollo'
import {
  TestDocument,
  TestQueryResult,
  TestQuery
} from '@/lib/queries/test.graphql'

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    const apolloClient = initializeApollo()

    const id = query.id as string

    const { data } = (await apolloClient.query({
      query: TestDocument,
      variables: {
        input: {
          id: id
        }
      }
    })) as TestQueryResult

    return {
      props: { data: data }
    }
  } catch {
    return { notFound: true }
  }
}

const Id = (({ data }: { data: TestQuery }) => {
  return <div>{data.test.name}</div>
}) as NextPage

export default Id
