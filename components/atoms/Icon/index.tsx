import { NextPage } from "next";
import { MouseEventHandler, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler;
}

const Icon: NextPage<Props> = ({ className, children, ...props }) => {
  return (
    <span {...props} className={`material-icons ${className}`}>
      {children}
    </span>
  );
};

export default Icon;
