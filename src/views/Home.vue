<template>
  <v-main>
    <v-parallax height="300" src="" alt="" style="background: #7f00ff" />

    <v-container class="mb-16">
      <v-alert
        prominent
        dense
        dark
        :color="status[system.status].color"
        :icon="status[system.status].icon"
      >
        <b v-if="system.status === 'None'">Some checks haven't completed yet</b>
        <b v-else-if="system.degraded">Some Systems Degraded</b>
        <b v-else-if="system.incident">Some Systems Incident</b>
        <b v-else>All Systems Operational</b>
      </v-alert>

      <v-card-title>
        Current status
        <v-spacer />
        <span class="caption text-right">
          {{ new Date() }}
        </span>
      </v-card-title>

      <v-row>
        <v-col cols="12" sm="6" v-for="service in services" :key="service.name">
          <v-card elevation="16">
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
        status: "None",
        degraded: false,
        incident: false,
      },
      status: {
        Normal: { icon: "mdi-check-circle", color: "green" },
        Degraded: { icon: "mdi-alert-circle", color: "orange" },
        Incident: { icon: "mdi-alert-circle", color: "red" },
        None: { icon: "mdi-checkbox-blank-circle-outline", color: "grey" },
      },
      services: [
        {
          icon: "mdi-home-roof",
          title: "Main",
          status: "None",
          desc: "",
          url: "https://x.hana.ooo/.well-known/apollo/server-health",
        },
        {
          icon: "mdi-cube",
          title: "Auth",
          status: "None",
          desc: "",
          url: "https://xauth.hana.ooo/.well-known/apollo/server-health",
        },
        {
          icon: "mdi-hammer-wrench",
          title: "Dev",
          status: "None",
          desc: "",
          url: "https://xdev.hana.ooo/.well-known/apollo/server-health",
        },
        {
          icon: "mdi-link-variant",
          title: "URI",
          status: "None",
          desc: "",
          url: "https://xuri.hana.ooo/.well-known/apollo/server-health",
        },
        {
          icon: "mdi-school",
          title: "School",
          status: "None",
          desc: "",
          url: "https://xschool.hana.ooo/.well-known/apollo/server-health",
        },
      ],
    })

    const getStatus = async (e: {
      url: string
      status: string
      desc: string
    }) => {
      try {
        await axios.get(e.url)

        e.status = "Normal"
      } catch (err) {
        state.system.degraded = true
        e.status = "Degraded"
        e.desc = err
      }
    }

    onBeforeMount(async () => {
      await Promise.all(state.services.map((e) => getStatus(e)))

      state.system.status = state.system.incident
        ? "Incident"
        : state.system.degraded
        ? "Degraded"
        : "Normal"

      const favicon = document.getElementById("favicon") as HTMLElement
      favicon.setAttribute("href", state.system.status + ".ico")
    })

    return {
      ...toRefs(state),
    }
  },
})
</script>
