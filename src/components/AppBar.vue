<template>
  <v-app-bar
    app
    elevate-on-scroll
    :color="$vuetify.theme.dark ? '#121212' : 'white'"
  >
    <v-toolbar-title>Hana Status</v-toolbar-title>

    <v-spacer />

    <v-menu
      v-model="menu"
      offset-y
      left
      :close-on-content-click="false"
      min-width="208"
      max-width="208"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon>
          <v-icon v-bind="attrs" v-on="on">mdi-apps</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-row no-gutters class="mx-2">
          <v-col cols="4" class="pa-2">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-avatar
                  color="orange"
                  class="white--text headline"
                  v-bind="attrs"
                  v-on="on"
                  @click="to('https://auth.hana.ooo')"
                >
                  <b></b>
                </v-avatar>
              </template>
              <span>Hana 계정</span>
            </v-tooltip>
          </v-col>
          <v-col cols="4" class="pa-2" v-for="item in items" :key="item">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-avatar
                  color="deep-purple accent-2"
                  class="white--text headline"
                  v-bind="attrs"
                  v-on="on"
                  @click="to(item.to)"
                >
                  <v-icon>{{ item.icon }}</v-icon>
                </v-avatar>
              </template>
              <span>{{ item.name }}</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from "@vue/composition-api"

export default defineComponent({
  name: "AppBar",

  setup() {
    const state = reactive({
      menu: false,
      items: [
        {
          name: "단축 URI",
          icon: "mdi-link-variant",
          color: "deep-purple accent-2",
          to: "https://uri.hana.ooo",
        },
      ],
    })

    const to = (url: string) => {
      window.open(url)
      state.menu = false
    }

    return {
      ...toRefs(state),
      to,
    }
  },
})
</script>
