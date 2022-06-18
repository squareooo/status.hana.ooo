import { GetServerSideProps, NextPage } from "next";

import { Props } from "./type";

import { initializeApollo } from "@/lib/apollo";
import { TestDocument, TestQueryResult } from "@/lib/queries/test.graphql";
import Draft from "@/components/templates/Draft";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    const apolloClient = initializeApollo();

    const { data } = (await apolloClient.query({
      query: TestDocument,
      variables: {
        input: {
          id: query.id,
        },
      },
    })) as TestQueryResult;

    return {
      props: { data, query },
    };
  } catch {
    return { notFound: true };
  }
};

const DraftPage: NextPage<Props> = (props) => <Draft {...props} />;

export default DraftPage;
