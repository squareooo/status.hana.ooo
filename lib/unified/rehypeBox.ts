import { h } from "hastscript";
import { Root } from "mdast";
import { Plugin } from "unified";
import { visit } from "unist-util-visit";

const rehypeBox: Plugin<[], Root> = () => {
  return (tree: any) => {
    visit(tree, (node) => {
      if (
        node.type === "textDirective" ||
        // node.type === "leafDirective" ||
        node.type === "containerDirective"
      ) {
        if (node.name !== "boxed") return;

        const data = node.data || (node.data = {});
        const tagName = node.type === "textDirective" ? "span" : "div";

        if (tagName === "div") {
          visit(node, (node) => {
            if (node.data?.directiveLabel) {
              node.data.hName = "div";
              node.data.hProperties = h("div", {
                class: "directiveLabel",
              }).properties;
            }
          });
        }

        data.hName = tagName;
        data.hProperties = h(tagName, { class: "boxed" }).properties;
      }
    });
  };
};

export default rehypeBox;
