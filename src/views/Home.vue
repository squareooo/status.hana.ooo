<template>
  <v-main>
    <!-- <v-parallax height="300" src="" /> -->

    <v-container>
      <v-alert
        prominent
        dense
        dark
        :color="status[system.status].color"
        :icon="status[system.status].icon"
      >
        <b v-if="!system.status">Some checks haven't completed yet</b>
        <b v-else-if="system.degraded">Some Systems Degraded</b>
        <b v-else-if="system.incident">Some Systems Incident</b>
        <b v-else>All Systems Operational</b>
      </v-alert>

      <v-card-title>
        Current status
        <v-spacer />
        <span class="caption">
          {{ new Date() }}
        </span>
      </v-card-title>
      <v-row>
        <v-col cols="12" sm="6" v-for="service in services" :key="service.name">
          <v-card>
            <v-list-item two-line>
              <v-list-item-avatar>
                <v-avatar color="#7f00ff" size="40">
                  <v-icon dark>{{ service.icon }}</v-icon>
                </v-avatar>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>{{ service.title }}</v-list-item-title>

                <v-list-item-subtitle>
                  {{ service.status }}
                </v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      :color="status[service.status].color"
                      v-bind="attrs"
                      v-on="on"
                    >
                      {{ status[service.status].icon }}
                    </v-icon>
                  </template>
                  <span>
                    {{ service.desc ? service.desc : service.status }}
                  </span>
                </v-tooltip>
              </v-list-item-action>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import {
  defineComponent,
  onBeforeMount,
  reactive,
  toRefs,
} from "@vue/composition-api"
import axios from "axios"

export default defineComponent({
  name: "Home",

  setup() {
    const state = reactive({
      system: {
        status: "",
        degraded: false,
        incident: false,
      },
      services: [
        {
          icon: "mdi-home-roof",
          title: "Main",
          status: "",
          desc: "",
          url: "https://hana.run/.well-known/apollo/server-health",
        },
        {
          icon: "mdi-cube",
          title: "Auth",
          status: "",
          desc: "",
          url: "https://auth.hana.run/.well-known/apollo/server-health",
        },
        {
          icon: "mdi-school",
          title: "School",
          status: "",
          desc: "",
          url: "https://school.hana.run/.well-known/apollo/server-health",
        },
      ],
      status: {
        Normal: { icon: "mdi-check-circle", color: "green" },
        Degraded: { icon: "mdi-alert-circle", color: "orange" },
        Incident: { icon: "mdi-alert-circle", color: "red" },
        "": { icon: "mdi-checkbox-blank-circle-outline", color: "grey" },
      },
    })

    onBeforeMount(async () => {
      for (const e of state.services) {
        await axios
          .get(e.url)
          .then(() => {
            e.status = "Normal"
          })
          .catch((err) => {
            state.system.degraded = true
            e.status = "Degraded"
            e.desc = err
          })
      }

      state.system.status = state.system.incident
        ? "Incident"
        : state.system.degraded
        ? "Degraded"
        : "Normal"
    })

    return {
      ...toRefs(state),
    }
  },
})
</script>
