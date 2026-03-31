<template>
  <v-card
    class="py-8 px-6 text-center mx-auto ma-4"
    elevation="4"
    max-width="400"
    width="100%"
  >
    <h3 class="text-title-large mt-0 mb-2">Enter Event Code</h3>

    <div class="text-body-medium mb-3">
      Enter the <strong>6-digit event code</strong> provided by the event
      organizer.
      <br />
      This code grants you access to the event.
    </div>

    <v-sheet color="surface">
      <v-otp-input
        v-model="otp"
        type="number"
        length="6"
        variant="solo"
        :disabled="loading"
        @complete="handleVerify"
      />

      <div class="text-caption mt-2 text-medium-emphasis">
        Don't have a code? Contact the event organizer or check your email/SMS.
      </div>
    </v-sheet>

    <v-btn
      class="my-4"
      color="purple"
      height="40"
      text="Verify"
      variant="flat"
      width="70%"
      :disabled="!isOtpValid || loading"
      :loading="loading"
      @click="handleVerify"
    />

    <div class="text-body-small">
      Need an event code?
      <a href="#" @click.prevent="contactOrganizer"> Contact organizer </a>
    </div>

    <!-- Success/Error Messages -->
    <v-alert
      v-if="success"
      type="success"
      variant="tonal"
      class="mt-4"
      closable
      @click:close="success = ''"
    >
      {{ success }}
    </v-alert>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mt-4"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const emit = defineEmits(["verified", "error"]);

const route = useRoute();
const router = useRouter();
const otp = ref("");
const loading = ref(false);
const success = ref("");
const error = ref("");

// Validate exactly 6 digits
const isOtpValid = computed(() => /^\d{6}$/.test(otp.value));

// Contact organizer handler
const contactOrganizer = () => {
  success.value =
    "Please contact the event organizer to receive your event code.";
  // Clear after 5 seconds
  setTimeout(() => {
    if (success.value) success.value = "";
  }, 5000);
};

// Verify event code
const handleVerify = async () => {
  if (!isOtpValid.value) {
    error.value = "Please enter a valid 6-digit event code";
    return;
  }

  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    // Call your verification API
    const response = await fetch("/api/events/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventKey: otp.value }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Invalid event code");
    }

    // Check if event requires secure access (eventSecret)
    if (data.event?.secureAccess || data.event?.eventSecret) {
      success.value = "Event verified. Logging you in securely...";
      // Redirect to login with eventSecret
      router.push({
        name: "EventLogin",
        query: { eventKey: otp.value, requiresSecret: "true" },
      });
    } else {
      success.value = data.event?.title
        ? `Welcome to ${data.event.title}`
        : "Event verified successfully!";

      // Emit verified event with event data
      emit("verified", data.event);

      // Redirect to event dashboard after short delay
      setTimeout(() => {
        router.push(`/event/${otp.value}`);
      }, 1500);
    }
  } catch (err) {
    const message = err.message?.includes("Invalid")
      ? "Invalid event code. Please check with the organizer."
      : err.message || "Verification failed. Please try again.";

    error.value = message;
    emit("error", message);

    // Clear OTP on error for better UX
    otp.value = "";
  } finally {
    loading.value = false;
  }
};

// Auto-detect event from URL query parameter
onMounted(() => {
  const eventKeyFromUrl = route.query.eventKey;

  if (eventKeyFromUrl && /^\d{6}$/.test(eventKeyFromUrl)) {
    otp.value = eventKeyFromUrl;
    // Auto-verify if eventKey is present in URL
    handleVerify();
  }
});
</script>

<style scoped>
/* Optional: Add smooth transitions */
.v-alert {
  transition: all 0.3s ease;
}
</style>
