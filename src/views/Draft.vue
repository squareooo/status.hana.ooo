<template>
  <v-layout fill-height>
    <v-sheet width="50%">
      <v-textarea v-model="text" />
    </v-sheet>
    <v-sheet color="#7f00ff0f" width="50%">
      <div v-html="html" />
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
import remarkRehype from "remark-rehype"
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
        .use(remarkRehype)
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
