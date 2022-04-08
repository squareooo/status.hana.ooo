import { visit } from 'unist-util-visit'

const answers = (tree: any) => {
  const lists: any = []
  visit(tree, 'list', (node) => {
    const tests: any = []
    const texts: any = []
    visit(node, 'listItem', (node) => {
      visit(node, 'paragraph', (node) => {
        visit(node, 'text', (data) => {
          texts.push(data.value)
        })
      })
    })

    for (const text of texts) {
      if (text.startsWith('[x]')) tests.push(1)
      else if (text.startsWith('[X]')) tests.push(-1)
      else tests.push(0)
    }

    if (tests.includes(0)) {
      lists.push(...tests)
      return
    }

    const object: any = { and: [], or: [] }
    for (const text of texts) {
      if (text.startsWith('[x]')) object.and.push(text.slice(3).trim())
      else if (text.startsWith('[X]')) object.or.push(text.slice(3).trim())
    }

    lists.push(object)
  })
  return lists
}

export default answers
