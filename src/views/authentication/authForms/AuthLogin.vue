<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import type { LoginCredentials } from "@/types/auth";
import { QrStream } from "vue3-qr-reader";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();
const route = useRoute();

const credentials = ref<LoginCredentials>({
  eventSecret: "",
  phone: "",
});

const qrScanned = ref(false);
const autoFilled = ref(false);
const showQrScanner = ref(false);
const cameraError = ref<string | null>(null);
const loginError = ref("");
const isCameraActive = ref(false);

// Extract event secret from any string (7-character alphanumeric)
function extractEventSecret(input: string): string | null {
  if (!input) return null;

  // Check for eventSecret=XXX pattern in URL/QR
  const fromQuery = input.match(/eventSecret=([A-Z0-9]{7})/i);
  if (fromQuery) return fromQuery[1].toUpperCase();

  // Standalone 7-character alphanumeric
  const standalone = input.match(/\b([A-Z0-9]{7})\b/i);
  return standalone?.[1].toUpperCase() || null;
}

// Format manual event secret input (7-character alphanumeric)
function formatEventSecretInput() {
  if (autoFilled.value) return;

  credentials.value.eventSecret = credentials.value.eventSecret
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);
}

// Handle paste event
function onEventSecretPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData("text") || "";
  const extracted = extractEventSecret(text);

  if (extracted) {
    credentials.value.eventSecret = extracted;
    qrScanned.value = true;
    autoFilled.value = true;
  } else {
    credentials.value.eventSecret = text.toUpperCase().slice(0, 7);
  }
  e.preventDefault();
}

// QR code handling
function onQrDecode(result: string) {
  const extracted = extractEventSecret(result);
  if (!extracted) return;

  credentials.value.eventSecret = extracted;
  qrScanned.value = true;
  autoFilled.value = true;
  showQrScanner.value = false;
  isCameraActive.value = false;
}

function onCameraError(err: any) {
  console.error("Camera error:", err);
  cameraError.value = "Unable to access camera. Check permissions.";
  isCameraActive.value = false;
}

// Auto-fill from URL on mount
onMounted(() => {
  const param = route.query.eventSecret;
  if (typeof param === "string") {
    const extracted = extractEventSecret(param);
    if (extracted) {
      credentials.value.eventSecret = extracted;
      qrScanned.value = true;
      autoFilled.value = true;
    }
  }
});

// Watch for dialog opening to activate camera
watch(showQrScanner, (newVal) => {
  if (newVal) {
    cameraError.value = null;
    isCameraActive.value = true;

    setTimeout(() => {
      isCameraActive.value = true;
    }, 100);
  } else {
    isCameraActive.value = false;
  }
});

// Validations
const validateEventSecret = (v: string) =>
  /^[A-Z0-9]{7}$/.test(v?.toUpperCase() || "");
const validatePhone = (v: string) => /^(07\d{8}|011\d{7})$/.test(v || "");

const isFormValid = computed(() => {
  const { eventSecret, phone } = credentials.value;
  const phoneValid = validatePhone(phone);

  return (
    (qrScanned.value || autoFilled.value || validateEventSecret(eventSecret)) &&
    phoneValid
  );
});

const isLoading = computed(() => userStore.loading);

// Login handler with proper redirect
async function handleLogin() {
  if (!isFormValid.value) return;

  try {
    await userStore.handleParticipantLogin(
      credentials.value.eventSecret,
      credentials.value.phone.trim(),
    );
    console.log("Login successful - redirecting to dashboard");

    localStorage.setItem("defaultDashboard", "PARTICIPANT");
    localStorage.setItem("participantEvent", credentials.value.eventSecret);

    await router.push("/events");
  } catch (err) {
    console.error("Login failed:", err);
    loginError.value = "Failed to setup event environment";
  }
}
</script>

<template>
  <div class="login-container">
    <v-form @submit.prevent="handleLogin" class="mt-7 login-form">
      <!-- Event Secret (7-character alphanumeric) -->
      <v-text-field
        v-model="credentials.eventSecret"
        label="Event Secret"
        class="mt-4 mb-8"
        required
        density="comfortable"
        variant="outlined"
        color="primary"
        :disabled="isLoading || qrScanned"
        maxlength="7"
        counter="7"
        @paste="onEventSecretPaste"
        @input="formatEventSecretInput"
        placeholder="e.g. A3B9C2D"
      >
        <template #append>
          <v-icon v-if="qrScanned" color="green">mdi-check-circle</v-icon>
          <v-btn
            v-else
            icon
            @click="showQrScanner = true"
            :disabled="isLoading"
          >
            <v-icon>mdi-qrcode-scan</v-icon>
          </v-btn>
        </template>
      </v-text-field>

      <!-- Phone (optional - if needed for participant login) -->
      <v-text-field
        v-model="credentials.phone"
        label="Phone Number"
        required
        density="comfortable"
        variant="outlined"
        color="primary"
        type="tel"
        class="mb-4"
        :disabled="isLoading"
        placeholder="0712345678"
      />

      <!-- Facilitator Login -->
      <div class="d-flex align-center mt-2 mb-7">
          <v-btn
        variant="plain"
        to="/register"
        class="mt-2 text-capitalize mr-n2"
        :disabled="isLoading"
      >
        Don't have an account?
      </v-btn>
        <v-spacer />
        <v-chip variant="outlined">
          <RouterLink
            to="/facilitator-login"
            class="text-primary text-decoration-none"
          >
            Facilitator Login
          </RouterLink>
        </v-chip>
      </div>

      <v-btn
        color="primary"
        :loading="isLoading"
        block
        class="mt-4"
        variant="flat"
        size="large"
        :disabled="!isFormValid || isLoading"
        type="submit"
      >
        Sign In
      </v-btn>

      <div v-if="userStore.error" class="mt-4">
        <v-alert color="error" variant="tonal">{{ userStore.error }}</v-alert>
      </div>
    </v-form>

    <!-- QR Scanner Dialog -->
    <v-dialog
      v-model="showQrScanner"
      width="400"
      @after-leave="isCameraActive = false"
    >
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Scan Event QR Code</span>
          <v-btn icon @click="showQrScanner = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="text-center">
          <div v-if="isCameraActive" class="qr-scanner-container">
            <qr-stream
              v-if="showQrScanner && isCameraActive"
              @decode="onQrDecode"
              @error="onCameraError"
              :track="false"
              class="qr-stream"
            />
            <div v-else class="camera-placeholder">
              <v-icon size="64" color="grey-lighten-1">mdi-camera-off</v-icon>
              <p class="mt-2">Camera inactive</p>
            </div>
          </div>
          <div v-else class="camera-loading">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
            <p class="mt-2">Initializing camera...</p>
          </div>

          <div v-if="cameraError" class="mt-4 text-red-600">
            <v-alert type="error" variant="tonal" density="compact">
              {{ cameraError }}
            </v-alert>
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              class="mt-2"
              @click="isCameraActive = true"
            >
              Retry
            </v-btn>
          </div>

          <p class="mt-4 text-caption text-grey">
            Point your camera at the event QR code
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            variant="text"
            block
            @click="showQrScanner = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="mt-5 text-right">
      <v-divider />
      <!-- <v-btn
        variant="plain"
        to="/register"
        class="mt-2 text-capitalize mr-n2"
        :disabled="isLoading"
      >
        Don't have an account?
      </v-btn> -->
    </div>

    <div v-if="loginError" class="mt-4">
      <v-alert color="error" variant="tonal" class="text-body-2">{{
        loginError
      }}</v-alert>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
}

.qr-scanner-container {
  width: 100%;
  height: 300px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;

  .qr-stream {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .camera-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
    color: #999;
  }
}

.camera-loading {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}
</style>
