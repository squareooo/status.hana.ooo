import type { NextPage } from "next";
import React from "react";

import { TestsQuery } from "@/lib/queries/tests.graphql";
import AppBar from "@/components/organisms/AppBar";
import Container from "@/components/atoms/Container";

interface Props {
  data: TestsQuery;
}

const Main: NextPage<Props> = ({ data }) => {
  return (
    <>
      <AppBar />

      <Container>
        {data.tests.edges?.map((test) => {
          return (
            <a href={`/${test?.node.id}`} key={test?.cursor}>
              <div>{test?.node.name}</div>
            </a>
          );
        })}
      </Container>
    </>
  );
};

export default Main;
