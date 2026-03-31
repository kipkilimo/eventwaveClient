<script setup lang="ts">
import Logo from "@/layouts/full/logo/LogoDark.vue";
import AuthRegister from "../authForms/AuthRegister.vue";
</script>

<template>
  <v-row class="h-screen" no-gutters>
    <v-col
      cols="12" 
    >
      <v-container
        elevation="10"
        width="100%"
        class="rounded-0 overflow-hidden"
      >
        <v-img
          src="https://rock-the-prototype.com/wp-content/uploads/2023/10/Vuetify-UI-Framework-fuer-Vue.jsNuxt.jpg"
          cover
          class="ma-2 align-center justify-center fill-height"
        />
      </v-container>
    </v-col>
  </v-row>
</template>

<style lang="scss">
.registerBox {
  max-width: 475px;
  margin: 0 auto;
}
.bg-black-opacity {
  background-color: rgba(
    0,
    0,
    0,
    0.5
  ); /* Slightly higher opacity for text clarity */
}
</style>
