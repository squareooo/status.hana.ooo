import { useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { styled } from '@/lib/stitches.config'
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

import Button from '@/components/atoms/Button'

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

const html = (text: string) => {
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
    .processSync(text)
    .toString();
}

export default (() => {
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [blocks, setBlocks] = useState<any>({})

  const handleTitleChange = (e: any) => {
    setTitle(e.target.value as string)
  }

  const handleTextChange = (e: any, id: string) => {
    blocks[id] = e.target.value
    setBlocks(blocks)

    let text = ""
    for (const id in blocks) {
      text += '\n\n' + blocks[id]
    }
    setText(html(text))
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

          <StyledPreview
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </StyledBox>

        <StyledRightBox>
          <StyledTitle
            placeholder="Title"
            spellCheck="false"
            value={title}
            onChange={handleTitleChange}
          />

          {Object.keys(blocks)?.map((id: string) => {
            return (
              <StyledTextarea
                placeholder="Text"
                spellCheck="false"
                defaultValue={blocks[id]}
                key={id}
                onChange={(e) => handleTextChange(e, id)}
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
}) as NextPage
