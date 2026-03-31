<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePaymentsStore } from "@/stores/payments";

/* -----------------------------
   Props
----------------------------- */
interface PaymentData {
  invoiceVouchers: string[];
  totalAmount: number; // USD
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
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

/* -----------------------------
   State
----------------------------- */
const paypalLoading = ref(true);
const success = ref<string | null>(null);
const error = ref<string | null>(null);

/* -----------------------------
   Stores & Router
----------------------------- */
const router = useRouter();
const paymentsStore = usePaymentsStore();

/* -----------------------------
   Amount (USD ONLY)
----------------------------- */
const totalUSD = computed(() => props.paymentData.totalAmount);

/* -----------------------------
   Lifecycle
----------------------------- */
onMounted(loadPaypal);

/* -----------------------------
   PayPal Loader
----------------------------- */
function loadPaypal() {
  if ((window as any).paypal) {
    renderPaypalButtons();
    return;
  }

  const script = document.createElement("script");
  script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
  script.async = true;
  document.body.appendChild(script);

  script.onload = renderPaypalButtons;
  script.onerror = () => {
    error.value = "Failed to load PayPal services.";
    paypalLoading.value = false;
  };
}

/* -----------------------------
   PayPal Buttons
----------------------------- */
function renderPaypalButtons() {
  const paypal = (window as any).paypal;

  if (!paypal) {
    error.value = "PayPal unavailable.";
    paypalLoading.value = false;
    return;
  }

  paypal
    .Buttons({
      style: {
        layout: "vertical",
        color: "blue",
        shape: "rect",
        label: "paypal",
        height: 45,
      },

      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [
            {
              description: "Invoice Payment",
              reference_id: props.paymentData.orgId,
              amount: {
                currency_code: "USD",
                value: totalUSD.value.toFixed(2),
              },
            },
          ],
        });
      },

      onApprove: async (_data: any, actions: any) => {
        try {
          const details = await actions.order.capture();

          await paymentsStore.handleMakeAccessPaymentViaPaypal({
            orgId: props.paymentData.orgId,
            invoiceVouchers: props.paymentData.invoiceVouchers,
            paymentOption: "full",
            paidAmountUSD: totalUSD.value,
            transactionReferenceNumber: details.id,
            isExternalOrg: props.paymentData.isExternalOrg,
          });

          success.value = "Payment successful";
          router.push("/dashboard");
        } catch (err: any) {
          error.value = err.message || "Payment failed.";
        }
      },

      onError: (err: any) => {
        error.value = "Payment error: " + err.message;
      },

      onInit: () => {
        paypalLoading.value = false;
      },
    })
    .render("#paypal-button-container");
}
</script>

<template>
  <v-card variant="outlined" class="pa-4">
    <v-card-text>
      <!-- PayPal -->
      <v-card variant="outlined" class="pa-3 mb-4">
        <v-card-title class="text-subtitle-1 font-weight-medium">
          Pay with PayPal
        </v-card-title>

        <!-- Loading -->
        <div v-if="paypalLoading" class="text-center py-4">
          <v-progress-circular
            indeterminate
            size="32"
            width="3"
            color="primary"
          />
          <p class="text-caption mt-2">Loading PayPal…</p>
        </div>

        <!-- Button -->
        <div
          id="paypal-button-container"
          class="mt-2"
          :class="{ 'opacity-50': paypalLoading }"
        ></div>
      </v-card>

      <!-- Summary -->
      <v-card variant="outlined" class="pa-3">
        <v-card-title class="text-subtitle-1 font-weight-medium">
          Payment Summary
        </v-card-title>

        <v-card variant="flat" class="pa-3 background-grey-lighten-3">
          <div class="d-flex justify-space-between mb-2">
            <span>Total Amount</span>
            <strong>USD {{ totalUSD.toFixed(2) }}</strong>
          </div>

          <v-divider class="my-2" />

          <div class="d-flex justify-space-between">
            <span class="font-weight-bold">Amount to Pay</span>
            <span class="font-weight-bold">
              USD {{ totalUSD.toFixed(2) }}
            </span>
          </div>
        </v-card>
      </v-card>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-chip variant="outlined" color="primary">
        Click the PayPal button above to complete payment
      </v-chip>
      <v-spacer />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
#paypal-button-container {
  min-height: 45px;
  margin-top: 0.5rem;
}

.background-grey-lighten-3 {
  background-color: rgb(240, 240, 240);
}

.opacity-50 {
  opacity: 0.5;
}
</style>
