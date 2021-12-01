<template>
  <v-app>
    <v-app-bar app dark>
      <v-app-bar-title>Test</v-app-bar-title>

      <v-spacer />
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  name: "App",

  data: () => ({
    //
  }),
})
</script>
