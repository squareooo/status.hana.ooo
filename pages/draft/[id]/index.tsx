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
import Icon from "@/components/atoms/Icon";
import { text } from "stream/consumers";

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

const HoverItems = styled("div", {
  display: "flex",
  visibility: "hidden",
  flexDirection: "column",
});

const Boxed = styled("div", {
  display: "flex",
  margin: "0.5rem 0",
  "&:hover": {
    [`& ${HoverItems}`]: {
      visibility: "visible",
    },
  },
});

const StyledTextarea = styled("textarea", {
  width: "100%",
  border: "none",
  resize: "none",
  outline: "none",
  height: "16rem",
  fontSize: "1rem",
  padding: "0 0.5rem",
  background: "transparent",
  scrollbarWidth: "none",
  "-ms-overflow-style": "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
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

const html = (markdown: string) => {
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
    .processSync(markdown)
    .toString();
};

const Draft: NextPage = ({ data, query }: any) => {
  const testId = query.id;
  const apolloClient = initializeApollo();
  const [createBlockMutation] = useCreateBlockMutation();
  const [updateBlockMutation] = useUpdateBlockMutation();
  const [title, setTitle] = useState(data.test.name);
  const [blocks, setBlocks] = useState<Array<any>>([]);

  const { data: blocksData } = useBlocksQuery({
    variables: {
      input: {
        testId: testId,
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

  const handleTextareaDrop = (e: any, index: number) => {
    if (!e.dataTransfer.files[0]) return;

    e.preventDefault();
    const files = [...e.dataTransfer.files];
    files.forEach(async (file) => {
      if (file.name.startsWith(".")) return alert("이 파일은 숨겨져 있습니다.");
      if (file.size >= 10485760) return alert("10MB를 초과하였습니다.");
      const contentType = mime.lookup(file.name);
      if (contentType === false) return alert("파일 형식을 지원하지 않습니다.");

      const newBlocks = JSON.parse(JSON.stringify(blocks));
      const newBlock = newBlocks[index];
      const isImage = contentType.startsWith("image/");
      const newline = newBlock.node.markdown ? "\n" : "";
      const fileType = isImage ? "!" : "";
      const fileName = isImage ? file.name.replace(/.\w*$/, "") : file.name;

      const { data } = (await apolloClient.mutate({
        mutation: CreatePresignedPostDocument,
        variables: {
          input: {
            testId: testId,
            fileName: file.name,
          },
        } as CreatePresignedPostMutationVariables,
      })) as CreatePresignedPostMutationResult;
      if (data == null) return;

      const formData = new FormData();
      const fields = data.createPresignedPost.fields;
      if (fields.ContentType) {
        formData.append("Content-Type", fields.ContentType);
      }
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
      newBlock.node.markdown += `${newline}${fileType}[${fileName}](${url})\n`;

      updateBlockMutation({
        variables: {
          input: {
            id: newBlock.node.id,
            markdown: newBlock.node.markdown,
          },
        },
      });
      setBlocks(newBlocks);
    });
  };

  const handleTitleChange = (e: any) => {
    setTitle(e.target.value as string);
  };

  const handleTextareaHeight = (e: any) => {
    const textarea: any = e?.target ?? e;
    if (!textarea) return
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleTextareaInput = (e: any, block: any, index: number) => {
    const newBlocks = JSON.parse(JSON.stringify(blocks));
    updateBlockMutation({
      variables: {
        input: {
          id: block.node.id,
          markdown: e.target.value,
        },
      },
    });
    newBlocks[index].node.markdown = e.target.value;
    setBlocks(newBlocks);
  };

  const addBlock = async (index: number) => {
    const newBlocks = JSON.parse(JSON.stringify(blocks));
    const newBlockIndex = index + 1;
    const { data } = await createBlockMutation({
      variables: {
        input: {
          testId: query.id,
          index: newBlockIndex,
          markdown: "",
        },
      },
    });
    newBlocks.splice(newBlockIndex, 0, {
      node: data?.createBlock,
    });
    newBlocks.map((block: any, index: number) => {
      if (block.node.index == index) return;

      updateBlockMutation({
        variables: {
          input: {
            id: block.node.id,
            index: index,
          },
        },
      });
      block.node.index = index;
    });
    setBlocks(newBlocks);
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
                  <div
                    dangerouslySetInnerHTML={{
                      __html: html(block.node.markdown),
                    }}
                  />
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

          {blocks?.map((block: any, index) => (
            <Boxed key={block.node.id}>
              <HoverItems>
                <Icon>close</Icon>
                <Icon onClick={() => addBlock(index)}>add</Icon>
              </HoverItems>

              <StyledTextarea
                ref={(e) => handleTextareaHeight(e)}
                placeholder="Text"
                spellCheck="false"
                value={block.node.markdown}
                onInput={(e) => handleTextareaInput(e, block, index)}
                onDrop={(e) => handleTextareaDrop(e, index)}
              />
            </Boxed>
          ))}

          {blocks.length == 0 && (
            <StyledAction>
              <Button onClick={() => addBlock(-1)}>블록 추가</Button>
            </StyledAction>
          )}
        </StyledBox>
      </StyledContainer>

      <style jsx global>
        {renderStyles}
      </style>
    </>
  );
};

export default Draft;
