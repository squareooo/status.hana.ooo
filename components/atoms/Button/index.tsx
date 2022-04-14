import { styled } from "@/lib/stitches.config";
import type { NextPage } from "next";
import { MouseEventHandler } from "react";

const StyledButton = styled("button", {
  color: "white",
  height: "2rem",
  padding: "0 1rem",
  background: "#7f00ff",
  borderRadius: "1rem",
  border: "1px solid #7f00ff",
  cursor: "pointer",
  transition: "all 0.15s ease",
  variants: {
    bordered: {
      true: {
        color: "#7f00ff",
        background: "white",
      },
    },
  },
});

interface ButtonProps {
  onClick?: MouseEventHandler;
  bordered?: boolean;
}

const Button: NextPage<ButtonProps> = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};

export default Button;
