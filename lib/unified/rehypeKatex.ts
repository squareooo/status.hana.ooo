import { Plugin } from 'unified'
import { Root } from 'hast'
import katex from 'katex'
import {visit} from 'unist-util-visit'
import {removePosition} from 'unist-util-remove-position'
import {toText} from 'hast-util-to-text'
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'

const assign = Object.assign

const parseHtml = unified().use(rehypeParse, {fragment: true})

const source = 'rehype-katex'

const rehypeKatex: Plugin<[katex.KatexOptions?], Root> = (options) => {
  const settings = options || {}
  const throwOnError = settings.throwOnError || false

  return (tree: any, file: any) => {
    visit(tree, 'element', (element) => {
      const classes =
        element.properties && Array.isArray(element.properties.className)
          ? element.properties.className
          : []
      const inline = classes.includes('math-inline')
      const displayMode = classes.includes('math-display')

      if (!inline && !displayMode) {
        return
      }

      const value = `\\displaystyle ${toText(element, {whitespace: 'pre'})}`

      let result: string

      try {
        result = katex.renderToString(
          value,
          assign({}, settings, {displayMode, throwOnError: true})
        )
      } catch (error_) {
        const error = (error_) as Error
        const fn = throwOnError ? 'fail' : 'message'
        const origin = [source, error.name.toLowerCase()].join(':')

        file[fn](error.message, element.position, origin)

        result = katex.renderToString(
          value,
          assign({}, settings, {
            displayMode,
            throwOnError: false,
            strict: 'ignore'
          })
        )
      }

      element.children = removePosition(parseHtml.parse(result), true).children
    })
  }
}

export default rehypeKatex