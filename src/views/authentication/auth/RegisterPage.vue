<!-- Register.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Logo from "@/layouts/full/logo/LogoDark.vue";
import AuthRegister from "../authForms/AuthRegister.vue";
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
  <v-container class="min-h-screen pa-0" fluid>
    <!-- Global Notification Component -->
    <GlobalNotification />

    <v-row class="min-h-screen" no-gutters>
      <!-- LEFT PANEL — Registration Form -->
      <v-col
        cols="12"
        :md="isMobile ? 12 : 5"
        :lg="isMobile ? 12 : 4"
        :order="isMobile ? 2 : 1"
        class="register-panel d-flex align-center justify-center"
      >
        <v-container class="pa-0" :fluid="!isMobile">
          <v-row no-gutters justify="center">
            <v-col
              cols="12"
              :sm="isMobile ? 12 : 11"
              :md="isMobile ? 12 : 10"
              :lg="isMobile ? 12 : 9"
            >
              <div class="register-content px-4 px-sm-6 px-md-8 px-lg-10">
                <!-- MOBILE HEADER -->
                <div v-if="isMobile">
                  <Logo class="mobile-logo" />
                </div>

                <!-- DESKTOP HEADER -->
                <div v-else class="desktop-header mb-8 pt-8">
                  <div class="text-center">
                    <Logo class="mb-6" :width="120" :height="60" />

                    <h1 class="text-h3 font-weight-bold text-primary mb-3">
                      Create Account
                    </h1>

                    <p class="text-body-1 text-medium-emphasis px-2">
                      Join our community and unlock exclusive benefits
                    </p>
                  </div>
                </div>

                <!-- REGISTER FORM -->
                <div class="form-container">
                  <AuthRegister />
                </div>

                <!-- HELP LINK -->
                <div class="text-center mt-5">
                  <v-btn
                    variant="text"
                    color="primary"
                    size="small"
                    class="text-caption px-0"
                  >
                    Need help registering?
                  </v-btn>
                </div>

                <!-- TERMS -->
                <div v-if="!isMobile" class="text-center mt-8">
                  <p class="text-caption text-disabled px-4">
                    By creating an account, you agree to our
                    <a href="#" class="text-primary text-decoration-none"
                      >Terms of Service</a
                    >
                    and
                    <a href="#" class="text-primary text-decoration-none"
                      >Privacy Policy</a
                    >
                  </p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-col>

      <!-- RIGHT PANEL — Promotions / Poster -->
      <v-col
        v-if="!isMobile"
        cols="12"
        md="7"
        lg="8"
        :order="isMobile ? 1 : 2"
        class="promotions-panel d-flex align-center justify-center"
      >
        <PromotionsViewer class="w-100 h-100" />
      </v-col>

      <!-- MOBILE PROMOTIONS DRAWER -->
      <v-navigation-drawer
        v-model="showPromotionsDrawer"
        temporary
        location="bottom"
        height="90%"
        class="mobile-drawer rounded-t-xl elevation-10"
      >
        <template #prepend>
          <div
            class="drawer-header d-flex align-center justify-space-between pa-4"
          >
            <div>
              <h3 class="text-h5 font-weight-bold text-primary">
                New Member Offers
              </h3>
              <p class="text-body-2 text-medium-emphasis mt-1">
                Exclusive benefits waiting for you
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

        <v-divider class="mb-2" />

        <PromotionsViewer compact class="pa-4" />

        <template #append>
          <div class="drawer-footer bg-primary-lighten-5 pa-4 text-center">
            <p class="text-caption text-disabled mb-2">
              Create your account to access these offers
            </p>

            <v-btn
              color="primary"
              variant="tonal"
              block
              @click="showPromotionsDrawer = false"
            >
              Continue Registration
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
  width: 100%;
}

/* STRUCTURE */
.register-panel {
  background: rgb(var(--v-theme-surface));
  overflow-y: auto;
}

.promotions-panel {
  background: rgb(var(--v-theme-primary-lighten-5));
}

/* CONTENT LAYOUT */
.register-content {
  max-width: 450px;
  margin: 0 auto;
  width: 100%;
}

.form-container {
  width: 100%;
}

/* RESPONSIVE BREAKPOINTS */
@media (min-width: 600px) and (max-width: 959px) {
  .register-content {
    max-width: 500px;
  }
}

@media (min-width: 960px) and (max-width: 1263px) {
  .register-content {
    max-width: 420px;
  }
}

@media (min-width: 1264px) and (max-width: 1903px) {
  .register-content {
    max-width: 450px;
  }
}

@media (min-width: 1904px) {
  .register-content {
    max-width: 500px;
  }
}

/* MOBILE OPTIMIZATIONS */
@media (max-width: 767px) {
  .mobile-logo {
    transform: scale(0.85);
    transform-origin: left center;
  }

  .register-content {
    padding: 1rem;
  }

  :deep(.v-field) {
    min-height: 56px;
    font-size: 16px; /* Prevents iOS zoom */
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
  .promotions-panel,
  .mobile-drawer {
    display: none !important;
  }
}

/* FULL WIDTH UTILITIES */
.w-100 {
  width: 100%;
}

.h-100 {
  height: 100%;
}
</style>
