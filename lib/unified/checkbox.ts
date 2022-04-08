import { u } from 'unist-builder'
import { visit } from 'unist-util-visit'

const checkbox = (id: string) => {
  return (tree: any) => {
    visit(tree, u('element', { tagName: "li" }), (node) => {
      visit(node, u('element', { tagName: "input" }), (node) => {
        node.properties.disabled = false
        node.properties.checked = false
        node.properties.class = id
        node.properties.onClick = "this.defaultChecked = !this.defaultChecked"
      })

      if (node.children[0].tagName !== "input") return
      node.children = [u('element', { tagName: "label", children: node.children })]
    })

    visit(tree, u('element', { tagName: "ul" }), (node) => {
      visit(node, u('element', { tagName: "li" }), (node) => {
        visit(node, u('element', { tagName: "input" }), (node) => {
          node.properties.type = "text"
          node.properties.onClick = null
        })

        visit(node, u('element', { tagName: "label" }), (node) => {
          if (node.children[0].tagName !== "input") return
          node.children[1].value = ""
        })
      })
    })
  }
}

export default checkbox
