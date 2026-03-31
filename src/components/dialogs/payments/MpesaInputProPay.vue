<script setup lang="ts">
import { ref, computed } from "vue";

/* -----------------------------
   Props
----------------------------- */
interface PaymentData {
  invoiceVouchers: string[];
  totalAmount: number; // USD from parent
  orgId: string;
  timestamp: number;
  isExternalOrg: boolean;
}

const props = defineProps<{
  paymentData: PaymentData;
}>();

/* -----------------------------
   Env
----------------------------- */
const VITE_DOLLAR_RATE = Number(import.meta.env.VITE_DOLLAR_RATE || 131);

/* -----------------------------
   State
----------------------------- */
const phoneNumber = ref("");

/* -----------------------------
   Validation
----------------------------- */
const isValidPhone = computed(() => {
  const regex = /^(?:\+254|0)?(7\d{8}|1\d{8})$/;
  return regex.test(phoneNumber.value.trim());
});

/* -----------------------------
   Amounts (FULL PAY ONLY)
----------------------------- */
const totalUSD = computed(() => props.paymentData.totalAmount);

const totalKES = computed(() =>
  Math.round(totalUSD.value * VITE_DOLLAR_RATE)
);

/* -----------------------------
   Helpers
----------------------------- */
const formatCurrency = (amount: number) =>
  amount.toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
</script>

<template>
  <v-container class="pa-2 bg-grey-lighten-4 mpesa-container">
    <v-card class="mx-auto" elevation="5">
      <!-- Header -->
      <v-card-title
        class="text-h5 font-weight-bold py-2 px-5 d-flex align-center"
        style="background-color:#4caf50;color:white"
      >
        <v-icon left class="mr-2">mdi-cellphone-check</v-icon>
        M-Pesa Payment
      </v-card-title>

      <v-card-text class="pa-5">
        <p class="mb-3 text-subtitle-1">
          Enter your M-Pesa number to complete payment.
        </p>

        <v-divider class="mb-4" />

        <!-- Phone -->
        <h3 class="text-subtitle-1 font-weight-bold mb-2">
          1. Payment Number
        </h3>
        <v-text-field
          v-model="phoneNumber"
          label="M-Pesa Phone Number"
          placeholder="07XX / 01XX / +2547XX"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-phone"
          :error="phoneNumber.length > 0 && !isValidPhone"
          :error-messages="
            phoneNumber.length > 0 && !isValidPhone
              ? 'Invalid Kenyan phone number'
              : ''
          "
        />

        <v-divider class="my-4" />

        <!-- Summary -->
        <v-card variant="tonal" color="green" class="pa-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">
            Payment Summary (KES)
          </h3>

          <div class="d-flex justify-space-between py-1">
            <span>Amount (USD)</span>
            <strong>${{ totalUSD.toFixed(2) }}</strong>
          </div>

          <div class="d-flex justify-space-between py-1">
            <span>Converted Amount</span>
            <strong>KES {{ formatCurrency(totalKES) }}</strong>
          </div>

          <v-divider class="my-3" />

          <div class="d-flex justify-space-between text-h5 font-weight-bold">
            <span>Total Payable</span>
            <span>KES {{ formatCurrency(totalKES) }}</span>
          </div>

          <p class="text-caption mt-2">
            Exchange rate: 1 USD = KES {{ VITE_DOLLAR_RATE }}
          </p>
        </v-card>
      </v-card-text>

      <!-- Action -->
      <v-card-actions class="pa-5 pt-0">
        <v-btn
          block
          size="large"
          color="#4CAF50"
          variant="flat"
          class="font-weight-bold text-white"
          :disabled="!isValidPhone"
        >
          <v-icon left>mdi-cash-check</v-icon>
          Initiate M-Pesa Payment
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
.mpesa-container {
  min-height: 77vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.v-card {
  max-width: 550px;
  width: 100%;
  border-radius: 10px;
}
</style>
