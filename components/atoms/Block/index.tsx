import { styled } from "@stitches/react";

const StyledBlock = styled("div", {
  margin: "0.5rem 0",
  padding: "0.5rem",
  borderRadius: "0.5rem",
  "@media (max-width: 1024px)": {
    borderRadius: "0",
  },
  variants: {
    mark: {
      true: {
        backgroundColor: "#00ff0020",
      },
      false: {
        backgroundColor: "#ff000020",
      },
    },
  },
});

export default StyledBlock;
