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

import checkboxes from '@/lib/unified/checkboxes'
import { TestQuery } from "@/lib/queries/test.graphql";
import { useBlocksQuery } from "@/lib/queries/blocks.graphql"
import Container from '@/components/atoms/Container'

interface Props {
  data: TestQuery;
}

const Post: NextPage<Props> = ({ data }) => {
  const [blocks, setBlocks] = useState<any>();
  
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

  const html = (text: string) => {
    return unified()
      .use(remarkParse)
      .use(remarkBreaks)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(remarkGfm)
      .use(rehypeRaw)
      .use(rehypeStringify)
      .use(checkboxes)
      .processSync(text)
      .toString();
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

      <Container>
        <h1>{data.test.name}</h1>

        {blocks?.map((block: any) => {
          if (!block) return <div>Loading...</div>;

          return (
            <div
              key={block.cursor}
              dangerouslySetInnerHTML={{ __html: html(block.node.markdown) }}
            />
          );
        })}
      </Container>
    </>
  );
};

export default Post;
