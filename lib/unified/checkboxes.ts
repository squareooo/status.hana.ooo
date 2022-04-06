import { u } from 'unist-builder'
import { visit } from 'unist-util-visit'

const checkboxes = () => {
  return (tree: any) => {
    visit(tree, u('element', { tagName: "input" }), (node) => {
      node.properties.and = node.properties.checked
      node.properties.disabled = false
      node.properties.checked = false
    })

    visit(tree, u('element', { tagName: "li" }), (node) => {
      if (node.children[0].tagName !== "input") return console.log(1)

      node.children = [u('element', { tagName: "label", children: node.children })]
    })
  }
}

export default checkboxes
