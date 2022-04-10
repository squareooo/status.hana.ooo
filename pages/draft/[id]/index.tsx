import { useEffect, useState } from 'react'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import 'katex/dist/katex.min.css'
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

import { initializeApollo } from '@/lib/apollo'
import { styled } from '@/lib/stitches.config'
import { TestDocument, TestQueryResult } from '@/lib/queries/test.graphql'
import { useBlocksQuery } from "@/lib/queries/blocks.graphql"
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

const StyledRightBox = styled('div', {
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
  '& *': {
    maxWidth: '100%'
  }
})

const StyledTextarea = styled('textarea', {
  border: '1px solid',
  borderRadius: '0.5rem',
  resize: 'none',
  outline: 'none',
  height: '300px',
  fontSize: '1rem',
  padding: '1rem',
  margin: '0.5rem 1rem',
  background: 'none'
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
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(remarkMath)
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .processSync(node.markdown)
    .toString();
}

const Draft: NextPage = ({ data, query }: any) => {
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
    for (const block of markdownBlocks) {
      if (block.node.id === id) block.node.markdown = e.target.value
    }
    setBlocks(markdownBlocks)
  }

  return (
    <>
      <Head>
        <title>Hana Draft</title>
      </Head>

      <StyledContainer>
        <StyledBox style={{ background: '#7f00ff0f' }}>
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
                  key={block.cursor}
                >
                  <div dangerouslySetInnerHTML={{ __html: html(block.node) }} />
                </Block>
              );
            })}
          </StyledPreview>
        </StyledBox>

        <StyledRightBox>
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
            <Button onClick={() => setBlocks({ ...blocks, 1: "", 2: "" })}>블록 추가</Button>
          </StyledAction>
        </StyledRightBox>
      </StyledContainer>
    </>
  )
}

export default Draft