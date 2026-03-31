<script setup lang="ts">
import { ref, computed } from "vue";

// Base payment amount in USD
const baseAmountUSD = 790;

// Discount percentage
const discount = 20;

// Exchange rate USD -> KES (Simulated live rate)
const exchangeRate = 131.0;

// Selected payment option: full or 2 installments
const paymentOption = ref("full"); // "full" | "installments"

// User phone number input
const phoneNumber = ref("");

// Validation helper: Kenya GSM (07xxxxxxx), special numbers (01xxx), with optional +254
const isValidPhone = computed(() => {
  // Regex: Starts with optional +254 or 0, followed by 7 or 1, and the rest of the digits.
  const regex = /^(?:\+254|0)?(7\d{8}|1\d{8})$/; // Corrected regex for 10 digits
  return regex.test(phoneNumber.value.trim());
});

// Computed amounts in USD
const discountedAmountUSD = computed(
  () => baseAmountUSD * (1 - discount / 100)
);

// Computed amounts in KES
const discountedAmountKES = computed(
  () => discountedAmountUSD.value * exchangeRate
);

// Rounding for currency display: full amount
const roundedDiscountedKES = computed(() =>
  Math.round(discountedAmountKES.value)
);

// Installment amount in KES (rounded to nearest shilling)
const installmentAmountKES = computed(() =>
  Math.round(roundedDiscountedKES.value / 2)
);

// Total amount to pay based on option (in KES)
const totalAmountKES = computed(() =>
  paymentOption.value === "full"
    ? roundedDiscountedKES.value
    : installmentAmountKES.value * 2
);

// Format number with commas
const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
</script>

<template>
  <v-container class="pa-2 bg-grey-lighten-4 mpesa-container">
    <v-card class="mx-auto" elevation="5">
      <v-card-title
        class="text-h5 font-weight-bold py-2 px-5 d-flex align-center"
        style="background-color: #4caf50; color: white"
      >
        <v-icon left color="white" class="mr-2">mdi-cellphone-check</v-icon>
        MPESA Payment Details
      </v-card-title>

      <v-card-text class="pa-5">
        <p class="mb-1 text-subtitle-1">
          Pay via MPESA using the number below. You are eligible for a
          <strong style="color: #4caf50">{{ discount }}% discount</strong>.
        </p>

        <v-divider class="mb-4 mt-2" />

        <h3 class="text-subtitle-1 font-weight-bold mb-2">
          1. Enter Payment Number
        </h3>
        <v-text-field
          v-model="phoneNumber"
          label="MPESA Phone Number"
          placeholder="e.g., 011XX/ 07XX or +254 1/7XX"
          :error="phoneNumber.length > 0 && !isValidPhone"
          :error-messages="
            phoneNumber.length > 0 && !isValidPhone
              ? 'Invalid Kenyan 10-digit number (07/01 prefix)'
              : ''
          "
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-phone"
          class="mb-1"
        />

        <v-divider class="mb-1 mt-1" />

        <h3 class="text-subtitle-1 font-weight-bold mb-3">
          2. Choose Payment Option
        </h3>
        <v-row>
          <v-col cols="6">
            <v-radio-group
              v-model="paymentOption"
              row
              hide-details
              class="mt-0"
            >
              <v-radio
                label="Full Payment"
                value="full"
                color="#092457"
              ></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="6">
            <v-radio-group
              v-model="paymentOption"
              row
              hide-details
              class="mt-0"
            >
              <v-radio
                label="2 Installments"
                value="installments"
                color="#092457"
              ></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <v-card variant="tonal" color="#4caf50" class="pa-4 mt-3 total-summary">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">
            3. Payment Summary (KES)
          </h3>

          <div
            class="d-flex justify-space-between align-center py-1 text-medium-emphasis"
          >
            <span class="font-weight-medium"
              >Original Amount (USD {{ baseAmountUSD }})</span
            >
            <span class="text-right font-weight-bold"
              >KES
              <span class="text-decoration-line-through">{{
                formatCurrency(Math.round(baseAmountUSD * exchangeRate))
              }}</span></span
            >
          </div>

          <div class="d-flex justify-space-between align-center py-1">
            <span class="font-weight-medium"
              >Discounted Amount ({{ discount }}% off)</span
            >
            <span class="text-right font-weight-bold text-success"
              >KES {{ formatCurrency(roundedDiscountedKES) }}</span
            >
          </div>

          <v-divider class="my-3" />

          <div v-if="paymentOption === 'installments'">
            <div
              class="d-flex justify-space-between align-center py-1 text-h6 font-weight-black"
            >
              <span class="font-weight-black">Installment Amount:</span>
              <span class="text-right font-weight-black" style="color: #4caf50">
                2 x KES {{ formatCurrency(installmentAmountKES) }}
              </span>
            </div>
          </div>
          <div v-else>
            <div
              class="d-flex justify-space-between align-center py-1 text-h5 font-weight-black"
            >
              <span class="font-weight-black">Total Amount to Pay:</span>
              <span class="text-right font-weight-black" style="color: #4caf50">
                KES {{ formatCurrency(totalAmountKES) }}
              </span>
            </div>
          </div>
          <p class="text-caption mt-2">
            *Exchange rate applied: 1 USD = KES
            {{ exchangeRate.toFixed(2) }}
          </p>
        </v-card>
      </v-card-text>
      <hr class="py-1"/>
      <v-card-actions class="pa-5 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          :disabled="!isValidPhone"
          color="#4caf50"
          variant="flat"
          size="large"
          block
          class="font-weight-bold text-white"
        >
          <v-icon left>mdi-cash-check</v-icon>
          Initiate MPESA Payment
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
  overflow: hidden; /* Ensures header color covers edges */
}

.total-summary {
  border-radius: 6px;
  /* Further customization for the summary box */
}

/* Ensure font is readable */
.v-card-text p,
.v-text-field {
  color: #333;
}
</style>
