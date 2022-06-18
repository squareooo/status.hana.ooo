import { useState } from "react";

import { Props } from "./type";

import { useBlocksQuery } from "@/lib/queries/blocks.graphql";

export const useStates = (props: Props) => {
  const testId = props.query.id;
  const [title, setTitle] = useState(props.data?.test.name);
  const [blocks, setBlocks] = useState<any[]>([]);
  
  const { data: blocksData } = useBlocksQuery({
    variables: {
      input: {
        testId: testId,
      },
    },
  });

  const getter = {
    title,
    blocks,
    blocksData,
  };

  const setter = {
    setTitle,
    setBlocks,
  };

  return { ...getter, ...setter, ...props };
};
