import type { NextPage } from "next";
import Head from "next/head";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

import { TestQuery } from "@/lib/queries/test.graphql";
import { useBlocksQuery } from "@/lib/queries/blocks.graphql";

interface Props {
  data: TestQuery;
}

const Post: NextPage<Props> = ({ data }) => {
  const { data: blocksData } = useBlocksQuery({
    variables: {
      input: {
        testId: data.test.id,
      },
    },
  });

  const html = (text: string) => {
    return unified()
      .use(remarkParse)
      .use(remarkBreaks)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(remarkGfm)
      .use(rehypeRaw)
      .use(rehypeStringify)
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

      <div>
        <h1>{data.test.name}</h1>

        {blocksData?.blocks.edges?.map((block) => {
          if (!block) return <div>Loading...</div>;

          return (
            <div
              key={block.cursor}
              dangerouslySetInnerHTML={{ __html: html(block.node.markdown) }}
            />
          );
        })}
      </div>
    </>
  );
};

export default Post;
