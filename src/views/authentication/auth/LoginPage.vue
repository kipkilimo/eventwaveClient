<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Logo from "@/layouts/full/logo/LogoDark.vue";
import AuthLogin from "../authForms/AuthLogin.vue";
import PromotionsViewer from "./PromotionsViewer.vue";
import GlobalNotification from "@/views/notifications/Notifications.vue";

const isMobile = ref(false);
const showPromotionsDrawer = ref(false);

const checkMobile = () => {
  // Use a reliable breakpoint for mobile/desktop split, typically 960px for Vuetify 'sm-and-up'
  isMobile.value = window.innerWidth < 960;
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
  <v-container fluid class="pa-0 min-h-screen">
    <!-- Global Notification Component -->
    <GlobalNotification />

    <v-row no-gutters class="min-h-screen">
      <v-col
        cols="12"
        :lg="isMobile ? 12 : 5"
        :order="isMobile ? 1 : 1"
        class="login-panel d-flex align-center justify-center"
      >
        <v-container :fluid="isMobile" class="login-container">
          <v-row justify="center" no-gutters>
            <v-col
              cols="12"
              :sm="isMobile ? 12 : 10"
              :md="isMobile ? 12 : 8"
              :lg="isMobile ? 12 : 10"
            >
              <div class="login-content pa-4 pa-sm-6">
                <div
                  v-if="isMobile"
                  class="mobile-header mb-6 d-flex justify-space-between align-center"
                >
                  <Logo class="mobile-logo" />
                  <v-btn
                    variant="outlined"
                    color="primary"
                    size="small"
                    prepend-icon="mdi-tag-multiple"
                    @click="showPromotionsDrawer = true"
                  >
                    Offers
                  </v-btn>
                </div>

                <div v-else class="desktop-header text-center mb-8">
                  <Logo class="mb-4" :width="100" :height="50" />
                  <h1 class="text-h4 font-weight-bold text-primary mb-2">
                    Welcome Back
                  </h1>
                  <p class="text-body-1 text-medium-emphasis px-2">
                    Sign in to access your account
                  </p>
                </div>

                <div class="form-container">
                  <AuthLogin />
                </div>

                <!-- <div class="text-center mt-4">
                  <v-btn
                    variant="text"
                    color="primary"
                    size="small"
                    class="px-0 text-caption"
                  >
                    Need help signing in?
                  </v-btn>
                </div> -->

                <div v-if="!isMobile" class="text-center mt-8">
                  <p class="text-caption text-disabled px-4">
                    By signing in, you agree to our
                    <a
                      href="#"
                      class="text-primary font-weight-medium text-decoration-underline"
                      >Terms of Service</a
                    >
                    and
                    <a
                      href="#"
                      class="text-primary font-weight-medium text-decoration-underline"
                      >Privacy Policy</a
                    >
                  </p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-col>

      <v-col
        v-if="!isMobile"
        cols="12"
        lg="7"
        order="2"
        class="promotions-panel d-flex align-center justify-center"
      >
        <PromotionsViewer class="w-100 h-100" />
      </v-col>

      <v-navigation-drawer
        v-model="showPromotionsDrawer"
        temporary
        location="bottom"
        height="90%"
        class="mobile-drawer rounded-t-xl elevation-10"
      >
        <template #prepend>
          <div
            class="drawer-header d-flex justify-space-between align-center pa-4 pb-0"
          >
            <div>
              <h3 class="text-h5 font-weight-bold text-primary">
                Current Offers
              </h3>
              <p class="text-body-2 text-medium-emphasis mt-1">
                Exclusive benefits for members
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

        <PromotionsViewer compact class="pa-4 pt-2" />

        <template #append>
          <div class="drawer-footer bg-grey-lighten-4 pa-4 text-center">
            <p class="text-caption text-disabled mb-2">
              Sign in to access these exclusive offers
            </p>
            <v-btn
              color="primary"
              variant="flat"
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
/*
  The SCSS has been simplified to focus on core layout and touch targets,
  relying heavily on Vuetify's responsive utility classes.
*/

.min-h-screen {
  min-height: 100vh;
  width: 100%;
}

/* PANELS */
.login-panel {
  background: rgb(var(--v-theme-surface));
  overflow-y: auto;
}

.promotions-panel {
  background: rgb(var(--v-theme-primary-lighten-5));
}

/* CONTENT CONTAINER */
.login-container {
  width: 100%;
  // Set max width on the container for larger screens
  @media (min-width: 960px) {
    max-width: 500px;
  }
}

.login-content {
  width: 100%;
  max-width: 400px; // Standard max width for form content
  margin: 0 auto;
}

/* MOBILE SPECIFIC */
.mobile-logo {
  // Slight scale to keep the logo prominent but not overwhelming on small screens
  transform: scale(0.9);
  transform-origin: left center;
}

/* TOUCH TARGETS (Ensure inputs and buttons are large enough for fingers) */
:deep(.v-field) {
  min-height: 56px;
  font-size: 1rem;
}

:deep(.v-btn) {
  min-height: 48px;
}

/* DRAWER */
.mobile-drawer {
  :deep(.v-navigation-drawer__content) {
    overflow-y: auto;
  }
  .drawer-footer {
    border-top: 1px solid rgb(var(--v-theme-grey-lighten-1));
  }
}

/* UTILITIES */
.w-100 {
  width: 100%;
}
.h-100 {
  height: 100%;
}
</style>
