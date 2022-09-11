import { styled } from "@stitches/react";
import type { NextPage } from "next";
import React from "react";

import Container from "@/components/atoms/Container";
import AppBar from "@/components/organisms/AppBar";
import { TestsQuery } from "@/lib/queries/tests.graphql";

const Outlined = styled("div", {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  flexWrap: "wrap",
  "& > *": {
    margin: "0.5rem",
  },
});

const Boxed = styled("div", {
  display: "inline-block",
  width: "150px",
});

const Cover = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: "150px",
  height: "200px",
  background: "#7f00ff",
  borderRadius: "0.5rem",
});

const CoverTitle = styled("div", {
  display: "flex",
  alignItems: "center",
  color: "#fff",
  fontWeight: 700,
  height: "75%",
  padding: "0.5rem",
  margin: "0 auto",
});

const Label = styled("div", {
  display: "inline-block",
  margin: "0.5rem",
  color: "black",
  fontWeight: 700,
});

interface Props {
  data: TestsQuery;
}

const Main: NextPage<Props> = ({ data }) => {
  return (
    <>
      <AppBar />

      <Container>
        <Outlined>
          {data.tests.edges?.map((test) => (
            <a href={`/${test?.node.id}`} key={test?.cursor}>
              <Boxed>
                <Cover>
                  <CoverTitle>{test?.node.name}</CoverTitle>
                </Cover>
                <Label>{test?.node.id.slice(0, 6)}</Label>
              </Boxed>
            </a>
          ))}
        </Outlined>
      </Container>
    </>
  );
};

export default Main;
