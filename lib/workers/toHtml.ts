import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

import rehypeBox from "@/lib/unified/rehypeBox";
import rehypeCheckbox from "@/lib/unified/rehypeCheckbox";
import rehypeKatex from "@/lib/unified/rehypeKatex";

export default {};

self.onmessage = ({ data }) => {
  const tree = unified()
    .use(rehypeBox)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex, { output: "html", fleqn: true })
    .use(rehypeCheckbox, data.id)
    .runSync(data.tree);

  const output = unified().use(rehypeStringify).stringify(tree);

  self.postMessage({ output, index: data.index });
};
