import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import "katex/dist/katex.min.css";
import "katex/contrib/mhchem";

import renderStyles from "@/styles/render";
import answers from "@/lib/unified/answers";
import { TestQuery } from "@/lib/queries/test.graphql";
import { useBlocksQuery } from "@/lib/queries/blocks.graphql";
import Container from "@/components/atoms/Container";
import Block from "@/components/atoms/Block";
import AppBar from "@/components/organisms/AppBar";

interface Props {
  data: TestQuery;
}

const Post: NextPage<Props> = ({ data }) => {
  const [blocks, setBlocks] = useState<any>([]);

  const { data: blocksData } = useBlocksQuery({
    variables: {
      input: {
        testId: data.test.id,
      },
    },
  });

  useEffect(() => {
    const worker = new Worker(
      new URL("@/lib/workers/toHtml.ts", import.meta.url)
    );

    if (blocksData == null || blocksData.blocks.edges == null) return;
    const edges = [...blocksData.blocks.edges];
    edges.sort((a, b) => a.node.index - b.node.index);
    edges.forEach(({ node }: any, index: number) => {
      const tree = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkDirective)
        .parse(node.markdown);
      worker.postMessage({ tree, ...node, index });
    });

    const nodes = JSON.parse(JSON.stringify(edges));
    worker.onmessage = ({ data }) => {
      nodes[data.index].node.html = data.output;
      const datas = JSON.parse(JSON.stringify(nodes));
      setBlocks(datas);
    };
  }, [blocksData]);

  const mark = () => {
    const markBlocks = JSON.parse(JSON.stringify(blocks));
    markBlocks.map((block: any) => {
      const tree = unified().use(remarkParse).parse(block.node.markdown);
      const mark = answers(tree);
      if (mark[0] == null) return;

      block.node.mark = true;
      const inputs = document.querySelectorAll(
        `input[class="${block.node.id}"]`
      );
      inputs.forEach((input: any, index) => {
        if (mark[index] === 1 && input.defaultChecked === false)
          return (block.node.mark = false);
        else if (mark[index] === 0 && input.defaultChecked === true)
          return (block.node.mark = false);
      });
    });
    setBlocks(markBlocks);
  };

  return (
    <>
      <Head>
        <title>{data.test.name}</title>
        <meta property="og:type" content="article" />
        <meta property="og:title" content={data.test.name} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={data.test.name} />
      </Head>

      <AppBar />

      <Container>
        <h1>{data.test.name}</h1>

        {blocks?.map((block: any) => {
          if (!block) return <div>Loading...</div>;

          return (
            <Block mark={block.node.mark} key={block.node.id}>
              <div dangerouslySetInnerHTML={{ __html: block.node.html }} />
            </Block>
          );
        })}

        <button onClick={mark}>mark</button>
      </Container>

      <style jsx global>
        {renderStyles}
      </style>
    </>
  );
};

export default Post;
