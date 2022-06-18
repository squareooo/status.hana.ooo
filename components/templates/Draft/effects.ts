import { useEffect } from "react";

import { States } from "./type";

export const useEffects = (state: States) => {
  useEffect(() => {
    document.ondragover = (e) => {
      e.preventDefault();
    };
  }, []);

  useEffect(() => {
    if (state.blocksData == null || state.blocksData.blocks.edges == null)
      return;

    const newBlocks = JSON.parse(JSON.stringify(state.blocksData.blocks.edges));
    newBlocks.sort((a: any, b: any) => a.node.index - b.node.index);
    state.setBlocks(newBlocks);
  }, [state.blocksData]);
};
