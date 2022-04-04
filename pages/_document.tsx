import NextDocument, { Html, Head, Main, NextScript } from "next/document"
import { getCssText } from "../lib/stitches.config"

class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head>
          <style
            id="stitches"
            dangerouslySetInnerHTML={{ __html: getCssText() }}
          />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Document
