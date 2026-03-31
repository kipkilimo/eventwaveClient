<script setup lang="ts">
import { ref, computed } from "vue";

/* -----------------------------
   Props / Payment Data
----------------------------- */
interface PaymentData {
  invoiceVouchers: string[];
  totalAmount: number; // USD
  orgId: string;
  orgName: string;
  timestamp: number;
  isExternalOrg: boolean;
}

const props = defineProps<{
  paymentData: PaymentData;
}>();

/* -----------------------------
   Base & Discount
----------------------------- */
 
/* -----------------------------
   Helpers
----------------------------- */
const formatUSD = (amount: number) =>
  amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
</script>

<template>
  <v-container class="pa-1 bg-grey-lighten-4 invoice-container">
    <v-card class="mx-auto" elevation="5">
      <!-- ================= HEADER ================= -->
      <v-card-title
        class="text-h6 font-weight-bold py-3 px-5 d-flex align-center"
        style="background-color: #232f3e; color: white"
      >
        <v-icon left color="#fff457" class="mr-2">
          mdi-invoice-text-outline
        </v-icon>
        Bank Transfer Payment Summary
      </v-card-title>

      <!-- ================= AMOUNT SUMMARY ================= -->
      <v-card
        outlined
        max-width="97%"
        class="ma-2 mr-6 pa-4 mt-3 total-summary"
      >
        <h3 class="text-subtitle-1 font-weight-bold mb-3">Amount Summary</h3>

        <div class="d-flex justify-space-between align-center py-1">
          <span class="font-weight-medium">Amount</span>
          <span class="font-weight-bold">
            USD {{ formatUSD(props.paymentData.totalAmount) }}
          </span>
        </div> 

        

        <v-divider class="my-3" />
<!-- 
        <div class="d-flex justify-space-between align-center py-1">
          <span class="font-weight-bold text-subtitle-1">
            Total Payable
          </span>
          <span class="font-weight-bold text-h6">
            USD {{ props.paymentData.totalAmount }}
          </span>
        </div> -->
      </v-card>

      <v-divider class="my-4" />

      <!-- ================= PAYMENT INFO ================= -->
      <v-card-text class="pa-5">
        <p class="mb-4 text-subtitle-1">
          Please deposit the payment to the account below,
          <strong style="color: #092457">
            quoting the organization name and at least one voucher number
          </strong>
          in the payment narration.
        </p>

        <v-divider class="my-4" />

        <!-- ================= ACCOUNT DETAILS ================= -->
        <h3 class="text-subtitle-1 font-weight-bold mb-3">
          Account Details
        </h3>

        <v-card variant="outlined" class="pa-3 rounded-lg account-card">
          <v-row class="kv-row">
            <v-col cols="4" class="kv-label">Bank</v-col>
            <v-col cols="8" class="kv-value">
              Diamond Trust Bank, Busia Branch
            </v-col>
          </v-row>

          <v-divider />

          <v-row class="kv-row">
            <v-col cols="4" class="kv-label">Account Name</v-col>
            <v-col cols="8" class="kv-value">
              CountySquare Business Solutions
            </v-col>
          </v-row>

          <v-divider />

          <v-row class="kv-row">
            <v-col cols="4" class="kv-label">Account Number</v-col>
            <v-col cols="8" class="kv-value account-number">
              0691452001
            </v-col>
          </v-row>

          <v-divider />

          <v-row class="kv-row">
            <v-col cols="4" class="kv-label">Narration / Purpose</v-col>
            <v-col cols="8" class="kv-value text-wrap">
               {{ paymentData.orgName }} - EventWave invoices including {{ paymentData.invoiceVouchers[0] }})
            </v-col>
          </v-row>

          <v-divider />

          <v-row class="kv-row">
            <v-col cols="5" class="kv-label">Payment Methods</v-col>
            <v-col cols="7" class="kv-value">
              SWIFT / IBAN / RTGS / Local Deposit
            </v-col>
          </v-row>
        </v-card>
      </v-card-text>

      <!-- ================= FOOTER ================= -->
      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-chip color="#092457" variant="text" size="large">
          <i>E-mail your deposit slip to Event Wave to confirm payment</i>
        </v-chip>
        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
.invoice-container {
  min-height: 72vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.v-card {
  max-width: 600px;
  width: 100%;
  margin-top: 30px;
  border-radius: 8px;
}

/* ===== Amount Summary ===== */
.total-summary {
  border: 2px solid #092457 !important;
  background-color: #fffaf0;
}

/* ===== Key–Value Layout ===== */
.account-card {
  background-color: #ffffff;
  border: 1.5px solid #e0e0e0;
}

.kv-row {
  align-items: center;
  padding: 6px 0;
}

.kv-label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.kv-value {
  text-align: right;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
}

.account-number {
  font-size: 1.2rem;
  letter-spacing: 1px;
  color: #092457;
}

.text-wrap {
  white-space: normal;
}
</style>
