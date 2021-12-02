<template>
  <v-layout fill-height>
    <v-sheet width="50%">
      <v-container>
        <v-textarea v-model="text" outlined full-width />
      </v-container>
    </v-sheet>
    <v-sheet color="#7f00ff0f" width="50%">
      <v-container>
        <div v-html="html" />
      </v-container>
    </v-sheet>
  </v-layout>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  reactive,
  toRefs,
} from "@vue/composition-api"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkBreaks from "remark-breaks"
import remarkRehype from "remark-rehype"
import remarkMath from "remark-math"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeKatex from "rehype-katex"
import rehypeHighlight from "rehype-highlight"
import rehypeStringify from "rehype-stringify"

export default defineComponent({
  name: "Draft",

  setup() {
    const state = reactive({
      text: "",
    })

    const html = computed(() =>
      unified()
        .use(remarkParse)
        .use(remarkBreaks)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(remarkMath)
        .use(remarkGfm)
        .use(rehypeRaw)
        .use(rehypeKatex)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .processSync(state.text)
    )

    return {
      ...toRefs(state),
      html,
    }
  },
})
</script>
