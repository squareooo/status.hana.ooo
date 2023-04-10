import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import rehypeBox from "@/lib/unified/rehypeBox";
import rehypeCheckbox from "@/lib/unified/rehypeCheckbox";
import rehypeKatex from "@/lib/unified/rehypeKatex";

const toHtml = {};

self.onmessage = ({ data }) => {
  const tree = unified()
    .use(rehypeBox)
    .use(remarkBreaks)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex, {
      output: "html",
      fleqn: true,
      trust: (context) => context.command === "\\includegraphics",
    })
    .use(rehypeCheckbox, data.id)
    .runSync(data.tree);

  const output = unified().use(rehypeStringify).stringify(tree);

  self.postMessage({ output, index: data.index });
};

export default toHtml;
