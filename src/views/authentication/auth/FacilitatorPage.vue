<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Logo from "@/layouts/full/logo/LogoDark.vue";
import AuthFacilitator from "../authForms/AuthFacilitator.vue";
import PromotionsViewer from "./PromotionsViewer.vue";
import GlobalNotification from "@/views/notifications/Notifications.vue";

const isMobile = ref(false);
const showPromotionsDrawer = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

<template>
  <v-container fluid class="min-h-screen pa-0">
    <!-- Global Notification Component -->
    <GlobalNotification />

    <v-row no-gutters class="min-h-screen">
      <!-- LEFT PANEL — Facilitator Login -->
      <v-col
        cols="12"
        :md="isMobile ? 12 : 4"
        :lg="isMobile ? 12 : 4"
        :order="isMobile ? 2 : 1"
        class="left-panel d-flex align-center justify-center"
      >
        <v-container class="pa-0" :fluid="!isMobile">
          <v-row no-gutters justify="center">
            <v-col cols="12" :sm="12" :md="12" :lg="10">
              <div class="content px-4 px-sm-6 px-md-8">
                <!-- MOBILE HEADER -->
                <div
                  v-if="isMobile"
                  class="mobile-header d-flex align-center justify-space-between mb-6"
                >
                  <Logo class="mobile-logo" />
                  <v-btn
                    variant="outlined"
                    color="primary"
                    size="small"
                    prepend-icon="mdi-account-multiple-outline"
                    @click="showPromotionsDrawer = true"
                  >
                    View Platform
                  </v-btn>
                </div>

                <!-- DESKTOP HEADER -->
                <div v-else class="desktop-header mb-10 pt-10 text-center">
                  <Logo class="mb-6" :width="120" :height="60" />
                  <h1 class="text-h4 font-weight-bold text-primary mb-2">
                    Facilitator Access
                  </h1>
                  <p class="text-body-1 text-medium-emphasis">
                    Manage and monitor platform activities
                  </p>
                </div>

                <!-- FORM -->
                <v-card
                  variant="outlined"
                  class="rounded-lg"
                  :class="{ 'elevation-2': !isMobile }"
                >
                  <v-card-text class="pa-5 pa-sm-7">
                    <AuthFacilitator />
                  </v-card-text>
                </v-card>

                <!-- SECURITY NOTE -->
                <div class="text-center mt-4">
                  <p class="text-caption text-disabled">
                    <v-icon size="small" class="mr-1"
                      >mdi-shield-account</v-icon
                    >
                    Restricted administrative access
                  </p>
                </div>

                <!-- SUPPORT -->
                <div v-if="!isMobile" class="text-center mt-6">
                  <p class="text-caption text-disabled">
                    Support:
                    <a
                      href="mailto:platform-admin@domain.com"
                      class="text-primary text-decoration-none"
                    >
                      platform-admin@domain.com
                    </a>
                  </p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-col>

      <!-- RIGHT PANEL — Desktop Poster -->
      <v-col
        v-if="!isMobile"
        cols="12"
        md="8"
        lg="8"
        :order="2"
        class="right-panel d-flex align-center justify-center"
      >
        <PromotionsViewer class="w-100 h-100" />
      </v-col>

      <!-- MOBILE DRAWER -->
      <v-navigation-drawer
        v-model="showPromotionsDrawer"
        temporary
        location="bottom"
        height="85%"
        class="mobile-drawer rounded-t-xl elevation-10"
      >
        <template #prepend>
          <div class="d-flex align-center justify-space-between pa-4">
            <div>
              <h3 class="text-h5 font-weight-bold text-primary">
                Platform Overview
              </h3>
              <p class="text-body-2 text-medium-emphasis">
                Administrative tools and insights
              </p>
            </div>
            <v-btn
              icon
              variant="tonal"
              size="small"
              @click="showPromotionsDrawer = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </template>

        <v-divider />

        <PromotionsViewer compact class="pa-4" />

        <template #append>
          <div class="pa-4 bg-primary-lighten-5 text-center">
            <p class="text-caption text-disabled mb-2">
              Facilitator access provides administrative controls
            </p>
            <v-btn
              color="primary"
              variant="tonal"
              block
              @click="showPromotionsDrawer = false"
            >
              Back to Login
            </v-btn>
          </div>
        </template>
      </v-navigation-drawer>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
.min-h-screen {
  min-height: 100vh;
}

/* PANELS */
.left-panel {
  background: rgb(var(--v-theme-surface));
  overflow-y: auto;
}

.right-panel {
  background: rgb(var(--v-theme-primary-lighten-5));
}

/* CONTENT WIDTH */
.content {
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
}

/* RESPONSIVE WIDTH TUNING */
@media (min-width: 960px) and (max-width: 1263px) {
  .content {
    max-width: 430px;
  }
}

@media (min-width: 1264px) and (max-width: 1903px) {
  .content {
    max-width: 480px;
  }
}

@media (min-width: 1904px) {
  .content {
    max-width: 520px;
  }
}

/* MOBILE */
@media (max-width: 767px) {
  .mobile-logo {
    transform: scale(0.85);
    transform-origin: left center;
  }

  :deep(.v-field) {
    min-height: 56px;
    font-size: 16px;
  }

  :deep(.v-btn) {
    min-height: 48px;
  }
}

/* DRAWER */
.mobile-drawer {
  :deep(.v-navigation-drawer__content) {
    overflow-y: auto;
  }
}

/* PRINT */
@media print {
  .right-panel,
  .mobile-drawer {
    display: none !important;
  }
}

.w-100 {
  width: 100%;
}
.h-100 {
  height: 100%;
}
</style>
