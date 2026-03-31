<script setup lang="ts">
import { ref, computed } from "vue";

// Base payment amount
const baseAmount = 790;

// Discount percentage
const discount = 20;

// Selected payment option: full or 2 installments
const paymentOption = ref("full"); // "full" | "installments"

// Computed amounts
const discountedAmount = computed(() => baseAmount * (1 - discount / 100));
const installmentAmount = computed(
  () =>
    // Math.round is used here to ensure currency-like precision (2 decimal places)
    Math.round((discountedAmount.value / 2) * 100) / 100
);
const totalAmount = computed(() =>
  paymentOption.value === "full"
    ? discountedAmount.value
    : installmentAmount.value * 2
);
</script>

<template>
  <v-container class="pa-1 bg-grey-lighten-4 invoice-container">
    <v-card class="mx-auto" elevation="5">
      <v-card-title
        class="text-h6 font-weight-bold py-3 px-5 d-flex align-center"
        style="background-color: #232f3e; color: white"
      >
        <v-icon left color="#fff457" class="mr-2"
          >mdi-invoice-text-outline</v-icon
        >
        Bank Transfer Payment Summary
      </v-card-title>

      <v-card-text class="pa-5">
        <p class="mb-4 text-subtitle-1">
          Please deposit payment to the following account. You are eligible for
          a <strong style="color: #092457">{{ discount }}% discount</strong>.
        </p>

        <v-divider class="my-4" />

        <h3 class="text-subtitle-1 font-weight-bold mb-2">Account Details</h3>
        <v-list dense class="py-0">
          <v-list-item class="px-0 py-1 border-bottom">
            <v-list-item-content>
              <v-list-item-title class="font-weight-medium"
                >Bank:</v-list-item-title
              >
              <v-list-item-subtitle class="text-right font-weight-bold"
                >Diamond Trust Bank, Busia Branch</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>

          <v-list-item class="px-0 py-1 border-bottom">
            <v-list-item-content>
              <v-list-item-title class="font-weight-medium"
                >Account Name:</v-list-item-title
              >
              <v-list-item-subtitle class="text-right font-weight-bold"
                >CountySquare Business Solutions</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>

          <v-list-item class="px-0 py-1 border-bottom">
            <v-list-item-content>
              <v-list-item-title class="font-weight-medium"
                >Account Number:</v-list-item-title
              >
              <v-list-item-subtitle
                class="text-right font-weight-bold text-h2"
                style="color: #000"
                >0691452001</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>

          <v-list-item class="px-0 py-1">
            <v-list-item-content>
              <v-list-item-title class="font-weight-medium"
                >Payment Methods:</v-list-item-title
              >
              <v-list-item-subtitle class="text-right"
                >SWIFT / BAN / RTGS / Local Deposit</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider class="my-4" />

        <h3 class="text-subtitle-1 font-weight-bold mb-3">
          Select Payment Option
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

        <v-card outlined class="pa-4 mt-3 total-summary">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Amount Summary</h3>
          <div class="d-flex justify-space-between align-center py-1">
            <span class="font-weight-medium">Original Amount:</span>
            <span class="text-right font-weight-bold"
              >USD
              <span class="text-decoration-line-through">{{
                baseAmount.toFixed(0)
              }}</span></span
            >
          </div>

          <div class="d-flex justify-space-between align-center py-1">
            <span class="font-weight-medium"
              >Discounted Amount ({{ discount }}% off):</span
            >
            <span class="text-right font-weight-bold text-success"
              >USD {{ discountedAmount.toFixed(0) }}</span
            >
          </div>

          <v-divider class="my-3" />

          <div v-if="paymentOption === 'installments'">
            <div
              class="d-flex justify-space-between align-center py-1 text-h6 font-weight-black"
            >
              <span class="font-weight-black">Installment Amount:</span>
              <span class="text-right font-weight-black" style="color: #092457">
                2 x USD {{ installmentAmount.toFixed(0) }}
              </span>
            </div>
          </div>
          <div v-else>
            <div
              class="d-flex justify-space-between align-center py-1 text-h5 font-weight-black"
            >
              <span class="font-weight-black">Total Amount to Pay:</span>
              <span class="text-right font-weight-black" style="color: #092457">
                USD {{ totalAmount.toFixed(2) }}
              </span>
            </div>
          </div>
        </v-card>
      </v-card-text>

      <v-card-actions class="pa-5 pt-0">
        <v-spacer></v-spacer>
        <v-chip
          color="#092457"
          variant="text"
          size="large"
          block 
        >
         <i> E-mail your deposit slip to Event Wave to Confirm Payment</i>
        </v-chip>
                <v-spacer></v-spacer>

      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
.invoice-container {
  min-height: 72vh;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align to top for better invoice look */
}

.v-card {
  max-width: 600px; /* Wider card for a better invoice feel */
  width: 100%;
  margin-top: 30px;
  border-radius: 8px; /* Slight rounding for professional look */
}

/* Custom styles for list items to enhance table/invoice appearance */
.v-list-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.v-list-item-title,
.v-list-item-subtitle {
  flex: 1;
  padding: 0 8px;
}

.v-list-item-title {
  text-align: left;
}

.v-list-item-subtitle {
  text-align: right;
}

.border-bottom {
  border-bottom: 1px dashed #e0e0e0;
}

.total-summary {
  border: 2px solid #092457 !important; /* Highlight total summary */
  background-color: #fffaf0; /* Light background for the summary area */
}
</style>
