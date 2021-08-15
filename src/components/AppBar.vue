<template>
  <v-app-bar app flat :color="$vuetify.theme.dark ? '#121212' : 'white'">
    <v-toolbar-title>Hana Status</v-toolbar-title>

    <v-spacer></v-spacer>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api"

export default defineComponent({
  name: "AppBar",
})
</script>
