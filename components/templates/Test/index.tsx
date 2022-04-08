import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

import answers from "@/lib/unified/answers"
import checkboxes from '@/lib/unified/checkboxes'
import { TestQuery } from "@/lib/queries/test.graphql"
import { useBlocksQuery } from "@/lib/queries/blocks.graphql"
import Container from '@/components/atoms/Container'

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
    if (blocksData == null || blocksData.blocks.edges == null) return
    const edges = [...blocksData.blocks.edges]
    edges.sort((a, b) => a.node.index - b.node.index)
    setBlocks(edges)
  }, [blocksData])

  const html = (node: any) => {
    return unified()
      .use(remarkParse)
      .use(remarkBreaks)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(remarkGfm)
      .use(rehypeRaw)
      .use(rehypeStringify)
      .use(checkboxes, node.id)
      .processSync(node.markdown)
      .toString();
  }

  const mark = () => {
    const markBlocks = JSON.parse(JSON.stringify(blocks))
    markBlocks.map((block: any) => {
      const tree = unified()
        .use(remarkParse)
        .parse(block.node.markdown)
      const mark = answers(tree)
      if (mark[0] == null) return

      block.node.mark = true
      const inputs = document.querySelectorAll(`input[class="${block.node.id}"]`)
      inputs.forEach((input: any, index) => {
        if (mark[index] === 1 && input.defaultChecked === false) return block.node.mark = false
        else if (mark[index] === 0 && input.defaultChecked === true) return block.node.mark = false
      })
    })
    setBlocks(markBlocks)
  }

  return (
    <>
      <Head>
        <title>{data.test.name}</title>
        <meta property="og:type" content="article" />
        <meta property="og:title" content={data.test.name} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={data.test.name} />
      </Head>

      <Container>
        <h1>{data.test.name}</h1>

        {blocks?.map((block: any) => {
          if (!block) return <div>Loading...</div>;

          return (
            <div
              style={{ backgroundColor: block.node.mark === true ? "lightgreen" : block.node.mark === false ? "orange" : "white" }}
              key={block.node.id}
              dangerouslySetInnerHTML={{ __html: html(block.node) }}
            />
          );
        })}

        <button onClick={mark}>mark</button>
      </Container>
    </>
  );
};

export default Post;
