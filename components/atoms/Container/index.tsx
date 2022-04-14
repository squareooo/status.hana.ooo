import type { NextPage } from "next";
import React from "react";

import { styled } from "@stitches/react";

const StyledContainer = styled("main", {
  width: "1024px",
  margin: "0 auto",
  "@media (max-width: 1024px)": {
    width: "100%",
  },
});

const Container: NextPage = ({ children, ...props }) => {
  return <StyledContainer {...props}>{children}</StyledContainer>;
};

export default Container;
