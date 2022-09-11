import { NextPage } from "next";
import { useEffect, useState } from "react";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";

import Block from "@/components/atoms/Block";

interface Props {
  blocks: any[];
}

const Blocks: NextPage<Props> = ({ blocks }) => {
  const [renderBlocks, setRenderBlocks] = useState<any[]>([]);
  const [worker, setWorker] = useState<Worker>();

  useEffect(() => {
    const newWorker = new Worker(
      new URL("@/lib/workers/toHtml.ts", import.meta.url)
    );

    const blocks: any[] = [];
    newWorker.onmessage = ({ data }) => {
      blocks[data.index] = { html: data.output };
      const newBlocks = JSON.parse(JSON.stringify(blocks));
      setRenderBlocks(newBlocks);
    };

    setWorker(newWorker);
  }, []);

  useEffect(() => {
    blocks.forEach((block: any, index: number) => {
      const tree = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkDirective)
        .parse(block.node.markdown);
      worker?.postMessage({ tree, index });
    });
  }, [blocks, worker]);

  return (
    <>
      {renderBlocks?.map((block: any, index) => (
        <Block key={index}>
          <div dangerouslySetInnerHTML={{ __html: block.html }} />
        </Block>
      ))}
    </>
  );
};

export default Blocks;
