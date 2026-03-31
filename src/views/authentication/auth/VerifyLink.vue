<script setup lang="ts">
import { provide, ref, onMounted, onBeforeUnmount } from "vue";
import { useDisplay } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import Logo from "@/layouts/full/logo/LogoDark.vue";

// Detect mobile
const { mobile } = useDisplay();
const isMobile = ref(mobile.value);

// Provide minimal layout
provide("layout", {
  register: () => ({ isActive: ref(false), layoutItemStyles: ref({}) }),
  unregister: () => {},
  mainRect: ref({}),
  getLayoutItem: () => ({ size: 0, position: 0 }),
  updateLayout: () => {},
  layoutIsReady: ref(true),
});

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loading = ref(true);
const error = ref<string | null>(null);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  verifyToken();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobile);
});

async function verifyToken() {
  const magicToken = route.query.token as string | undefined;

  if (!magicToken) {
    error.value = "Invalid or missing verification link.";
    loading.value = false;
    setTimeout(() => router.replace("/login"), 2500);
    return;
  }

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/verify`,
      { token: magicToken },
      { timeout: 10000 },
    );

    const { user, token } = response.data;

    userStore.user = user;
    userStore.token = token;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setTimeout(() => {
      router.replace("/dashboard");
    }, 1500);
  } catch (err: any) {
    if (err.code === "ECONNABORTED") {
      error.value = "Request timed out. Try again.";
    } else if (err.response?.status === 401) {
      error.value = "Expired or invalid link.";
    } else {
      error.value = "Verification failed. Please try again.";
    }

    setTimeout(() => router.replace("/login"), 3000);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-row class="min-h-screen d-flex align-center justify-center">
    <v-col cols="12" sm="10" md="6" lg="4">
      <div class="text-center mb-8">
        <Logo :class="{ 'scale-80': isMobile }" />
      </div>

      <v-card class="pa-8 text-center" elevation="2">
        <!-- Loading -->
        <div v-if="loading">
          <v-progress-circular
            indeterminate
            size="80"
            width="5"
            color="primary"
          />
          <h3 class="mt-6 text-h6 font-weight-medium">Verifying your link…</h3>
          <p class="text-body-2 text-medium-emphasis mt-2">
            Please wait, this will only take a moment
          </p>
        </div>

        <!-- Success -->
        <div v-if="!loading && !error">
          <v-icon color="success" size="72" class="mb-4">
            mdi-check-circle-outline
          </v-icon>
          <h3 class="text-h6 font-weight-medium text-success">
            Verification Successful!
          </h3>
          <p class="text-body-2 text-medium-emphasis mt-2">
            Redirecting to your dashboard…
          </p>

          <v-progress-linear
            indeterminate
            color="success"
            height="4"
            class="mt-4"
          />
        </div>

        <!-- Error -->
        <div v-if="error">
          <v-icon color="error" size="72" class="mb-4">
            mdi-alert-circle-outline
          </v-icon>

          <v-alert type="error" variant="tonal" class="mb-4">
            {{ error }}
          </v-alert>

          <p class="text-body-2 text-medium-emphasis mb-4">
            Redirecting you shortly…
          </p>

          <v-progress-linear color="error" height="4" class="mb-4" />

          <v-btn
            color="primary"
            variant="tonal"
            block
            @click="router.replace('/login')"
          >
            Go to Login
          </v-btn>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
.scale-80 {
  transform: scale(0.8);
}

.v-progress-circular,
.v-icon {
  animation: pulse 2.2s infinite ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
