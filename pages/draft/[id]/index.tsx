import { useEffect, useState } from 'react'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkBreaks from "remark-breaks"
import remarkRehype from "remark-rehype"
import remarkMath from 'remark-math'
import remarkGfm from "remark-gfm"
import remarkDirective from "remark-directive"
import rehypeRaw from "rehype-raw"
import rehypeKatex from 'rehype-katex'
import rehypeStringify from "rehype-stringify"
import 'katex/dist/katex.min.css'
import 'katex/contrib/mhchem'

import box from "@/lib/unified/box"
import { initializeApollo } from '@/lib/apollo'
import { styled } from '@/lib/stitches.config'
import { TestDocument, TestQueryResult } from '@/lib/queries/test.graphql'
import { useBlocksQuery } from "@/lib/queries/blocks.graphql"
import { useCreateBlockMutation } from '@/lib/mutations/createBlock.graphql'
import { useUpdateBlockMutation } from '@/lib/mutations/updateBlock.graphql'
import Button from '@/components/atoms/Button'
import Block from '@/components/atoms/Block'

const StyledContainer = styled('div', {
  minHeight: '100%',
  display: 'flex'
})

const StyledBox = styled('div', {
  position: 'relative',
  width: '50%',
  display: 'flex',
  flex: '1 1',
  flexDirection: 'column',
  overflowY: 'auto'
})

const StyledTitle = styled('input', {
  border: 'none',
  outline: 'none',
  background: 'none',
  width: '100%',
  fontSize: '2rem',
  padding: '2rem'
})

const StyledPreview = styled('div', {
  fontSize: '1rem',
  padding: '0 2rem 2rem 2rem',
  wordWrap: 'break-word',
  '& img': {
    maxWidth: '100%'
  }
})

const StyledTextarea = styled('textarea', {
  border: '1px solid',
  resize: 'none',
  outline: 'none',
  height: '300px',
  fontSize: '1rem',
  padding: '1rem',
  margin: '0.5rem 1rem',
  background: 'white'
})

const StyledAction = styled('div', {
  width: '100%',
  padding: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'right'
})

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    const apolloClient = initializeApollo()
    const { data } = (await apolloClient.query({
      query: TestDocument,
      variables: {
        input: {
          id: query.id
        }
      }
    })) as TestQueryResult

    return {
      props: { data, query }
    }
  } catch {
    return { notFound: true }
  }
}

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
    .use(rehypeKatex, { output: "html", fleqn: true })
    .use(rehypeStringify)
    .processSync(node.markdown)
    .toString();
}

const Draft: NextPage = ({ data, query }: any) => {
  const [createBlockMutation] = useCreateBlockMutation()
  const [updateBlockMutation] = useUpdateBlockMutation()
  const [title, setTitle] = useState(data.test.name)
  const [blocks, setBlocks] = useState<any>([])

  const { data: blocksData } = useBlocksQuery({
    variables: {
      input: {
        testId: query.id as string,
      },
    },
  })

  useEffect(() => {
    if (blocksData == null || blocksData.blocks.edges == null) return
    const edges = [...blocksData.blocks.edges]
    edges.sort((a, b) => a.node.index - b.node.index)
    setBlocks(edges)
  }, [blocksData])

  const handleTitleChange = (e: any) => {
    setTitle(e.target.value as string)
  }

  const handleTextChange = (e: any, id: string) => {
    const markdownBlocks = JSON.parse(JSON.stringify(blocks))
    updateBlockMutation({
      variables: {
        input: {
          id: id,
          markdown: e.target.value,
        }
      }
    })
    for (const block of markdownBlocks) {
      if (block.node.id === id) block.node.markdown = e.target.value
    }
    setBlocks(markdownBlocks)
  }

  const addBlock = async () => {
    const { data } = await createBlockMutation({
      variables: {
        input: {
          testId: query.id,
          index: blocks.length ? blocks[blocks.length - 1].node.index + 1 : 0,
          markdown: ""
        }
      }
    })
    setBlocks([...blocks, {
      node: data?.createBlock
    }])
  }

  return (
    <>
      <Head>
        <title>Hana Draft</title>
      </Head>

      <StyledContainer>
        <StyledBox>
          <StyledTitle
            spellCheck="false"
            readOnly
            value={title}
          />

          <StyledPreview>
            {blocks?.map((block: any) => {
              if (!block) return <div>Loading...</div>;

              return (
                <Block
                  mark={block.node.mark}
                  key={block.node.id}
                >
                  <div dangerouslySetInnerHTML={{ __html: html(block.node) }} />
                </Block>
              );
            })}
          </StyledPreview>
        </StyledBox>

        <StyledBox style={{ background: '#7f00ff0f' }}>
          <StyledTitle
            placeholder="Title"
            spellCheck="false"
            value={title}
            onChange={handleTitleChange}
          />

          {blocks?.map(({node}: any) => {
            return (
              <StyledTextarea
                placeholder="Text"
                spellCheck="false"
                defaultValue={node.markdown}
                key={node.id}
                onChange={(e) => handleTextChange(e, node.id)}
              />
            );
          })}

          <StyledAction>
            <Button onClick={addBlock}>블록 추가</Button>
          </StyledAction>
        </StyledBox>
      </StyledContainer>

      <style jsx global>{`
        blockquote {
          border-left: 0.25rem solid black;
          padding: 0 0.5rem;
          margin: 0.5rem 0;
        }

        u {
          text-underline-offset: 0.125rem;
        }

        ol, ul {
          margin: 0 1.5rem;
        }

        .box {
          border: 1px solid black;
          margin: 0.5rem 0;
        }

        .box > p {
          margin: 0.5rem;
        }

        .box > .directiveLabel {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: black;
          color: white;
        }

        .box .box {
          margin: 0.5rem;
        }

        span.box {
          margin: 0 !important;
          padding: 0 0.5rem;
        }

        table {
          border: 1px solid;
          border-collapse: collapse;
          margin: 0.5rem;
        }

        table th, td {
          border: 1px solid;
          padding: 0.25rem;
          font-weight: inherit;
        }
      `}</style>
    </>
  )
}

export default Draft