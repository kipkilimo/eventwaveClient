<script setup lang="ts">
import { RouterView } from "vue-router";
import VerticalSidebarVue from "./vertical-sidebar/VerticalSidebar.vue";
import VerticalHeaderVue from "./vertical-header/VerticalHeader.vue";
import Customizer from "../blank/CustomizerPanel.vue";
import FooterPanel from "./footer/FooterPanel.vue";
import { useCustomizerStore } from "../../stores/customizer";
//import SettingsIcon from '@/components/icons/SettingsIcon.vue'; // Make sure to import SettingsIcon

const customizer = useCustomizerStore();
</script>

<template>
  <v-locale-provider>
    <v-app
      theme="PurpleTheme"
      :class="[
        customizer.fontTheme,
        customizer.mini_sidebar ? 'mini-sidebar' : '',
        customizer.inputBg ? 'inputWithbg' : '',
      ]"
      style="background-color: #dadada; min-height: 100vh"
    >
      <Customizer />
      <VerticalSidebarVue />
      <VerticalHeaderVue />

      <v-main class="pa-0 main-content">
        <v-container fluid class="page-wrapper pa-0">
          <v-app-bar height="2em" />
          <!-- Spacer for header -->

          <div class="content-area">
            <v-container class="content-container mt-10">
              <RouterView />
            </v-container>
          </div>
        </v-container>

        <FooterPanel />
      </v-main>
    </v-app>
  </v-locale-provider>
</template>

<style scoped>
.main-content {
  margin-left: 260px; /* Adjust based on your sidebar width */
  transition: margin-left 0.2s ease-in-out;
}

.mini-sidebar .main-content {
  margin-left: 80px; /* Adjust for mini sidebar width */
}

.content-area {
  min-height: calc(100vh - 120px); /* Adjust based on header + footer height */
  position: relative;
}

.content-container {
  padding-top: 24px;
  padding-bottom: 24px;
}

.customizer-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

/* Ensure proper stacking context */
.v-application {
  position: relative;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .main-content {
    margin-left: 0 !important;
  }
}
</style>
