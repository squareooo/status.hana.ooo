<template>
  <v-app>
    <AppBar />

    <router-view />
  </v-app>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount } from "@vue/composition-api"
import AppBar from "@/components/AppBar.vue"

export default defineComponent({
  name: "App",

  components: {
    AppBar,
  },

  setup(props, { root }) {
    onBeforeMount(() => {
      const dark = window.matchMedia("(prefers-color-scheme: dark)")
      root.$vuetify.theme.dark = dark.matches
      dark.addEventListener("change", () => {
        root.$vuetify.theme.dark = dark.matches
      })
    })
  },
})
</script>
