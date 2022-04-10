import { NextPage, GetServerSideProps } from 'next'

import Main from '@/components/templates/Main'
import { initializeApollo } from '@/lib/apollo'
import {
  TestsDocument,
  TestsQueryResult,
  TestsQuery
} from '@/lib/queries/tests.graphql'

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const apolloClient = initializeApollo()

    const tests = await apolloClient.query({
      query: TestsDocument,
      variables: {
        input: {}
      }
    }) as TestsQueryResult

    return {
      props: { data: { ...tests.data } }
    }
  } catch {
    return { notFound: true }
  }
}

const Index = (({ data }: { data: TestsQuery }) => {
  return <Main data={data} />
}) as NextPage

export default Index
