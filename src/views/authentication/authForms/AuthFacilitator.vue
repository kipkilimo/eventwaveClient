<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import { Form } from "vee-validate";
import { useRouter } from "vue-router";
import axios from "axios";
import { useNotification } from "@/composables/useNotification"; // Create this composable

// ---------------------------
// State
// ---------------------------
const router = useRouter();
const { showNotification } = useNotification(); // Use notification system

const credentials = ref<{ email: string }>({
  email: "",
});

const isLoading = ref(false);
const progress = ref(0);
let progressInterval: NodeJS.Timeout | null = null;

// ---------------------------
// Validation
// ---------------------------
const validateEmail = (value: string): boolean => {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const emailRules = [
  (v: string) => !!v || "Email is required",
  (v: string) => validateEmail(v) || "Enter a valid email address",
];

const isFormValid = computed(() => validateEmail(credentials.value.email));

// ---------------------------
// Helper Functions
// ---------------------------
const startProgressBar = () => {
  progress.value = 0;
  if (progressInterval) clearInterval(progressInterval);
  
  progressInterval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += 100 / 55; // 5.5 seconds total
    } else {
      closeCurrentTab()
      if (progressInterval) clearInterval(progressInterval);
    }
  }, 100);
};

const resetForm = () => {
  credentials.value.email = "";
  progress.value = 0;
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
};

// ---------------------------
// API Function
// ---------------------------
const requestMagicLink = async (email: string): Promise<string> => {
  try {
    // Use environment variable for API URL
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await axios.post(`${apiUrl}/api/auth/request-link`, { email });
    return response.data.message || 'Magic access link sent successfully!';
  } catch (err: any) {
    // Handle different error scenarios
    const status = err.response?.status;
    const errorMessage = err.response?.data?.message || 'Failed to send magic link. Please try again.';
    
    // Customize error message based on status code
    if (status === 404 || errorMessage.includes('not found')) {
      throw new Error('No account found with this email address. Please check your email or register for a new account.');
    } else if (status === 429) {
      throw new Error('Too many requests. Please wait a moment before trying again.');
    } else if (status === 400 && errorMessage.includes('invalid email')) {
      throw new Error('Please enter a valid email address.');
    } else {
      throw new Error(errorMessage);
    }
  }
}
 const closeCurrentTab = (): void => {
  window.open("", "_self"); // optional workaround
  window.close();
};
// ---------------------------
// Submit Handler
// ---------------------------
async function handleLogin() {
  // Validate form
  if (!isFormValid.value) return;
  
  isLoading.value = true;

  try {
    const responseMsg = await requestMagicLink(
      credentials.value.email.trim()
    );
    
    const requestedEmail = credentials.value.email.trim();
    
    // Show success notification
    showNotification({
      type: "success",
      title: "Magic Link Sent!",
      message: responseMsg,
      duration: 5500
    });
    
    startProgressBar();

    // Clear form and redirect after 5.5 seconds
    setTimeout(() => {
      resetForm();
      
      // Attempt to close tab or redirect
      if (window.opener && !window.closed) {
        window.close();
      } else {
        router.push({ 
          name: 'login-success', 
          query: { email: requestedEmail } 
        }).catch(() => {
          console.log('Redirect route not found, staying on current page');
        });
      }
    }, 5500);
    
  } catch (err: any) {
    console.error("Magic link request failed:", err);
    
    // Show error notification
    showNotification({
      type: "error",
      title: "Login Failed",
      message: err.message || "An unexpected error occurred",
      duration: 5000
    });
    
  } finally {
    isLoading.value = false;
  }
}

// Clean up interval on component unmount
onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }
});
</script>

<template>
  <div class="login-container">
    <h5 class="text-h5 text-center my-4 mb-8">
      Enter your email to get access link
    </h5>

    <Form @submit="handleLogin" class="mt-7 login-form">
      <!-- Email field with loading spinner indicator -->
      <v-text-field
        v-model="credentials.email"
        :rules="emailRules"
        label="Email Address"
        required
        density="comfortable"
        variant="outlined"
        color="primary"
        hide-details="auto"
        placeholder="you@example.com"
        :disabled="isLoading"
        class="mb-4"
      >
        <template v-if="isLoading" v-slot:append-inner>
          <v-progress-circular
            indeterminate
            color="primary"
            size="20"
            width="2"
          ></v-progress-circular>
        </template>
      </v-text-field>

      <!-- Button with loading spinner -->
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
        <template v-slot:loader>
          <v-progress-circular
            indeterminate
            color="white"
            size="20"
            width="2"
          ></v-progress-circular>
        </template>
        Request Access Link
      </v-btn>

      <!-- Additional loading overlay for full page coverage  <div v-if="isLoading" class="loading-overlay">
        <div class="loading-content">
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
            width="4"
          ></v-progress-circular>
          <p class="loading-text mt-3">Sending magic link...</p>
        </div>
      </div>-->
     

      <!-- Optional: Progress bar for successful submission -->
      <transition name="fade">
        <div v-if="progress > 0 && progress < 100" class="mt-4">
          <v-progress-linear
            :model-value="progress"
            color="success"
            height="2"
            class="mt-2"
          ></v-progress-linear>
          <v-alert
  type="success"
  dense
  text
  icon="mdi-information"
  class="mt-2"
>
  <p class="text-caption text-center mb-0">
    Check your email for access link. Closing request in 
    {{ Math.ceil((100 - progress) / (100 / 55)) }} seconds...
  </p>
</v-alert>
        </div>
      </transition>
    </Form>

    <div class="mt-5 text-right">
      <v-divider />
      <v-btn
        variant="plain"
        to="/register"
        class="mt-2 text-capitalize mr-n2"
        :disabled="isLoading"
      >
        Don't have an account?
      </v-btn>
    </div>
     <v-progress-linear v-if="isLoading"
      color="primary-darken-2"
      indeterminate
    ></v-progress-linear>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  position: relative;
}

.login-form {
  .v-text-field .v-field--active input {
    font-weight: 500;
  }
}

:deep(.v-field__counter) {
  font-size: 0.75rem;
}

// Loading overlay styles
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-content {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.loading-text {
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>