import css from "styled-jsx/css";

export default css.global`
  blockquote {
    border-left: 0.25rem solid black;
    padding: 0 0.5rem;
    margin: 0.5rem 0;
  }

  u {
    text-underline-offset: 0.125rem;
  }

  ul {
    list-style: none;
    list-style-position: inside;
  }

  ol {
    list-style: circled-numbers;
    list-style-position: inside;
  }

  @counter-style circled-numbers {
    system: fixed;
    symbols: ① ② ③ ④ ⑤ ⑥ ⑦ ⑧ ⑨ ⑩ ⑪ ⑫ ⑬ ⑭ ⑮ ⑯ ⑰ ⑱ ⑲ ⑳;
    suffix: " ";
  }

  .boxed {
    border: 1px solid black;
    margin: 0.5rem 0;
  }

  .boxed > p {
    margin: 0.5rem;
  }

  .boxed > .directiveLabel {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: black;
    color: white;
  }

  .boxed .boxed {
    margin: 0.5rem;
  }

  span.boxed {
    margin: 0 !important;
    padding: 0 0.5rem;
  }

  table {
    border: 1px solid;
    border-collapse: collapse;
    margin: 0.5rem;
  }

  table th,
  td {
    border: 1px solid;
    padding: 0.25rem;
    font-weight: inherit;
  }

  .katex > .katex-html > .base {
    margin: 0.25rem 0;
  }

  img {
    vertical-align: middle;
  }
`;
