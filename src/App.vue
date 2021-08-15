<template>
  <v-app>
    <AppBar />

    <router-view />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api"
import AppBar from "@/components/AppBar.vue"

export default defineComponent({
  name: "App",

  components: {
    AppBar,
  },
})
</script>
