<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, computed } from "vue";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import { useDialogStore } from "@/stores/dialog";
import TermsandConditions from "@/views/dialogs/TermsandConditions.vue";

const dialogStore = useDialogStore();
const router = useRouter();
const userStore = useUserStore();

// Form state
const formRef = ref();
const name = ref("");
const email = ref("");
const phone = ref("");
const agree = ref(false);
const showPhone = ref(false);

// Validation rules
const nameRules = [
  (v: string) => !!v || "Full name is required",
  (v: string) => v.length <= 155 || "Full name must not exceed 155 characters",
];

const emailRules = [
  (v: string) => !!v || "E-mail is required",
  (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email",
];

const phoneRules = [
  (v: string) => !!v || "Phone number is required",
  (v: string) =>
    /^(?:07\d{8}|011\d{7})$/.test(v) ||
    "Enter a valid Kenyan phone (0712345678 or 0111234567)",
];

// Computed property to check if form is valid and ready for submission
const isFormValid = computed(() => {
  return (
    name.value.trim() &&
    email.value.trim() &&
    phone.value.trim() &&
    agree.value &&
    nameRules.every(rule => rule(name.value) === true) &&
    emailRules.every(rule => rule(email.value) === true) &&
    phoneRules.every(rule => rule(phone.value) === true)
  );
});

// Form submission
async function handleRegister() {
  const form = formRef.value;
  if (!form) return;

  const { valid } = await form.validate();
  if (!valid || !isFormValid.value) return;

  try {
    await userStore.register({
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      role: "PARTICIPANT",
    });
    router.push("/");
  } catch (err: unknown) {
    alert(userStore.error || "Registration failed. Try again.");
  }
}
</script>

<template>
  <v-card elevation-2 class="register-wrapper" color="#f2f2f2">
    <h5 class="text-h5 text-center mb-6">Sign up with Email and Phone</h5>

    <v-form ref="formRef" lazy-validation class="mx-auto" style="width: 90%;">
      <v-text-field
        v-model="name"
        :rules="nameRules"
        label="Full Name"
        required
        variant="outlined"
        color="primary"
        density="comfortable"
        class="mb-4"
      />

      <v-text-field
        v-model="email"
        :rules="emailRules"
        label="Email Address"
        required
        variant="outlined"
        color="primary"
        density="comfortable"
        class="mb-4"
      />

      <v-text-field
        v-model="phone"
        :rules="phoneRules"
        label="Phone Number"
        required
        variant="outlined"
        color="primary"
        density="comfortable"
        hide-details="auto"
        :type="showPhone ? 'text' : 'phone'"
        :append-inner-icon="
          showPhone ? 'mdi-eye-check-outline' : 'mdi-eye-off-outline'
        "
        @click:append-inner="showPhone = !showPhone"
        class="mb-4"
      />

      <v-row class="align-center mb-6" no-gutters>
        <!-- Column 1: Independent Checkbox -->
        <v-col cols="4" sm="6">
          <v-checkbox
            v-model="agree"
            hide-details
            color="primary"
            class="ma-0 pa-0"
          >
            <template #label>
              <span>I agree</span>
            </template>
          </v-checkbox>
        </v-col>

        <!-- Column 2: Clickable Terms text -->
        <v-col
          cols="8"
          sm="6"
          class="text-sm-right text-left mt-2 mt-sm-0  justify-end"
        >
          <v-btn
            variant="text"
            class="text-primary text-decoration-underline text-capitalize pa-0"
             @click="dialogStore.open('termsDialog')"
          >
            Terms and Conditions
          </v-btn>
        </v-col>
      </v-row>

      <v-btn
        color="primary"
        block
        size="large"
        variant="flat"
        :loading="userStore.loading"
        :disabled="!isFormValid"
        @click="handleRegister"
      >
        Sign Up
      </v-btn>

      <div class="mt-5 text-right">
        <v-divider />
        <v-btn variant="plain" to="/login1" class="mt-2 text-capitalize mr-n2">
          Already have an account?
        </v-btn>
      </div>
    </v-form>
    
  </v-card>
    <!-- Mount the dialog globally -->
  <TermsandConditions />
</template>

<style scoped lang="scss">
.register-wrapper { 
  margin: auto;
  padding: 1.5rem;
}

// Optional: Add visual feedback for disabled state
.v-btn--disabled {
  opacity: 0.6;
}
</style>