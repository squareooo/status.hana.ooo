import { useEffect, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import mime from "mime-types";
import axios from "axios";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import "katex/dist/katex.min.css";
import "katex/contrib/mhchem";

import renderStyles from "@/styles/render";
import rehypeKatex from "@/lib/unified/rehypeKatex";
import box from "@/lib/unified/rehypeBox";
import { initializeApollo } from "@/lib/apollo";
import { styled } from "@/lib/stitches.config";
import { TestDocument, TestQueryResult } from "@/lib/queries/test.graphql";
import { useBlocksQuery } from "@/lib/queries/blocks.graphql";
import { useCreateBlockMutation } from "@/lib/mutations/createBlock.graphql";
import { useUpdateBlockMutation } from "@/lib/mutations/updateBlock.graphql";
import {
  CreatePresignedPostDocument,
  CreatePresignedPostMutationResult,
  CreatePresignedPostMutationVariables,
} from "@/lib/mutations/createPresignedPost.graphql";
import Button from "@/components/atoms/Button";
import Block from "@/components/atoms/Block";

const StyledContainer = styled("div", {
  minHeight: "100%",
  display: "flex",
});

const StyledBox = styled("div", {
  position: "relative",
  width: "50%",
  display: "flex",
  flex: "1 1",
  flexDirection: "column",
  overflowY: "auto",
});

const StyledTitle = styled("input", {
  border: "none",
  outline: "none",
  background: "none",
  width: "100%",
  fontSize: "2rem",
  padding: "2rem",
});

const StyledPreview = styled("div", {
  fontSize: "1rem",
  padding: "0 2rem 2rem 2rem",
  wordWrap: "break-word",
  "& img": {
    maxWidth: "100%",
  },
});

const StyledTextarea = styled("textarea", {
  border: "1px solid",
  resize: "none",
  outline: "none",
  height: "300px",
  fontSize: "1rem",
  padding: "1rem",
  margin: "0.5rem 1rem",
  background: "white",
});

const StyledAction = styled("div", {
  width: "100%",
  padding: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "right",
});

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    const apolloClient = initializeApollo();
    const { data } = (await apolloClient.query({
      query: TestDocument,
      variables: {
        input: {
          id: query.id,
        },
      },
    })) as TestQueryResult;

    return {
      props: { data, query },
    };
  } catch {
    return { notFound: true };
  }
};

const html = (node: any) => {
  return unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(box)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(remarkMath)
    .use(rehypeRaw)
    .use(rehypeKatex, {
      output: "html",
      fleqn: true,
      trust: (context) => context.command === "\\includegraphics",
    })
    .use(rehypeStringify)
    .processSync(node.markdown)
    .toString();
};

const Draft: NextPage = ({ data, query }: any) => {
  const apolloClient = initializeApollo();
  const [createBlockMutation] = useCreateBlockMutation();
  const [updateBlockMutation] = useUpdateBlockMutation();
  const [title, setTitle] = useState(data.test.name);
  const [blocks, setBlocks] = useState<any>([]);

  const { data: blocksData } = useBlocksQuery({
    variables: {
      input: {
        testId: query.id as string,
      },
    },
  });

  useEffect(() => {
    document.ondragover = (e) => {
      e.preventDefault();
    };
  }, []);

  useEffect(() => {
    if (blocksData == null || blocksData.blocks.edges == null) return;
    const edges = [...blocksData.blocks.edges];
    edges.sort((a, b) => a.node.index - b.node.index);
    setBlocks(edges);
  }, [blocksData]);

  const handleDrop = (e: any, id: string) => {
    if (!e.dataTransfer.files[0]) return;

    e.preventDefault();

    const files = [...e.dataTransfer.files];
    files.forEach(async (file) => {
      if (file.name.startsWith(".")) return alert("이 파일은 숨겨져 있습니다.");
      if (file.size >= 10485760) return alert("10MB를 초과하였습니다.");
      const contentType = mime.lookup(file.name);
      if (contentType === false) return alert("파일 형식을 지원하지 않습니다.");

      const markdownBlocks = JSON.parse(JSON.stringify(blocks));
      for (const block of markdownBlocks) {
        if (block.node.id === id) {
          const isImage = contentType.startsWith("image/");
          const newline = block.node.markdown ? "\n" : "";
          const fileType = isImage ? "!" : "";
          const fileName = isImage ? file.name.replace(/.\w*$/, "") : file.name;

          const { data } = (await apolloClient.mutate({
            mutation: CreatePresignedPostDocument,
            variables: {
              input: {
                blockId: id,
                fileName: file.name,
              },
            } as CreatePresignedPostMutationVariables,
          })) as CreatePresignedPostMutationResult;

          if (data == null) return;

          const formData = new FormData();
          const fields = data.createPresignedPost.fields;
          if (fields.ContentType)
            formData.append("Content-Type", fields.ContentType);
          formData.append("bucket", fields.bucket);
          formData.append("X-Amz-Algorithm", fields.XAmzAlgorithm);
          formData.append("X-Amz-Credential", fields.XAmzCredential);
          formData.append("X-Amz-Date", fields.XAmzDate);
          formData.append("key", fields.key);
          formData.append("Policy", fields.Policy);
          formData.append("X-Amz-Signature", fields.XAmzSignature);
          formData.append("file", file);

          await axios.post(data.createPresignedPost.url, formData);

          const url = `${data.createPresignedPost.url}/${fields.key}`;
          block.node.markdown += `${newline}${fileType}[${fileName}](${url})\n`;

          updateBlockMutation({
            variables: {
              input: {
                id: id,
                markdown: block.node.markdown,
              },
            },
          });

          setBlocks(markdownBlocks);
        }
      }
    });
  };

  const handleTitleChange = (e: any) => {
    setTitle(e.target.value as string);
  };

  const handleTextChange = (e: any, id: string) => {
    const markdownBlocks = JSON.parse(JSON.stringify(blocks));
    updateBlockMutation({
      variables: {
        input: {
          id: id,
          markdown: e.target.value,
        },
      },
    });
    for (const block of markdownBlocks) {
      if (block.node.id === id) block.node.markdown = e.target.value;
    }
    setBlocks(markdownBlocks);
  };

  const addBlock = async () => {
    const { data } = await createBlockMutation({
      variables: {
        input: {
          testId: query.id,
          index: blocks.length ? blocks[blocks.length - 1].node.index + 1 : 0,
          markdown: "",
        },
      },
    });
    setBlocks([
      ...blocks,
      {
        node: data?.createBlock,
      },
    ]);
  };

  return (
    <>
      <Head>
        <title>Hana Draft</title>
      </Head>

      <StyledContainer>
        <StyledBox>
          <StyledTitle spellCheck="false" readOnly value={title} />

          <StyledPreview>
            {blocks?.map((block: any) => {
              if (!block) return <div>Loading...</div>;

              return (
                <Block mark={block.node.mark} key={block.node.id}>
                  <div dangerouslySetInnerHTML={{ __html: html(block.node) }} />
                </Block>
              );
            })}
          </StyledPreview>
        </StyledBox>

        <StyledBox style={{ background: "#7f00ff0f" }}>
          <StyledTitle
            placeholder="Title"
            spellCheck="false"
            value={title}
            onChange={handleTitleChange}
          />

          {blocks?.map(({ node }: any) => {
            return (
              <StyledTextarea
                placeholder="Text"
                spellCheck="false"
                defaultValue={node.markdown}
                key={node.id}
                onChange={(e) => handleTextChange(e, node.id)}
                onDrop={(e) => handleDrop(e, node.id)}
              />
            );
          })}

          <StyledAction>
            <Button onClick={addBlock}>블록 추가</Button>
          </StyledAction>
        </StyledBox>
      </StyledContainer>

      <style jsx global>
        {renderStyles}
      </style>
    </>
  );
};

export default Draft;
