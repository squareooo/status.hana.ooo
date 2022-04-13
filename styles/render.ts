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

  ol,
  ul {
    margin: 0 1.5rem;
  }

  .box {
    border: 1px solid black;
    margin: 0.5rem 0;
  }

  .box > p {
    margin: 0.5rem;
  }

  .box > .directiveLabel {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: black;
    color: white;
  }

  .box .box {
    margin: 0.5rem;
  }

  span.box {
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
`;
