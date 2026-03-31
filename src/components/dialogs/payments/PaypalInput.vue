<template>
  <v-card variant="outlined" class="pa-4"> 
    
    <v-card-text>
      <!-- PayPal Payment Section -->
      <v-row class="mb-2">
        <v-col cols="12">
          <v-card variant="outlined" class="pa-1">
            <v-card-title class="text-subtitle-1 font-weight-medium">Pay with PayPal</v-card-title>
            
            <!-- Loading State -->
            <div v-if="paypalLoading" class="text-center py-4">
              <v-progress-circular
                indeterminate
                color="#092457"
                size="32"
                width="3"
                class="mb-2"
              ></v-progress-circular>
              <p class="text-caption text-medium-emphasis">Loading PayPal...</p>
            </div>
            
            <!-- PayPal Button Container -->
            <div 
              id="paypal-button-container" 
              class="mt-2"
              :class="{ 'opacity-50': paypalLoading }"
            ></div>
          </v-card>
        </v-col>
      </v-row>
 
      <!-- Payment Options Section -->
      <v-card variant="outlined" class="pa-3 mb-4">
        <v-card-title class="text-subtitle-1 font-weight-medium">Pay with Paypal</v-card-title>
        
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

        <v-card variant="flat" class="pa-3 mt-3 background-grey-lighten-3">
          <div class="d-flex justify-space-between mb-2">
            <span class="text-caption">Original Amount:</span>
            <span class="text-caption font-weight-medium">USD {{ baseAmountUSD }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-caption">Discounted Amount (20% off):</span>
            <span class="text-caption font-weight-medium">USD {{ discountedAmountUSD }}</span>
          </div>
          <v-divider class="my-2" />
          <div class="d-flex justify-space-between">
            <span class="text-body-2 font-weight-bold">
              {{ paymentOption === 'installments' ? 'Installment Amount:' : 'Total Amount to Pay:' }}
            </span>
            <span class="text-body-2 font-weight-bold">
              {{ paymentOption === 'installments' ? `2 x USD ${installmentAmountUSD}` : `USD ${totalAmountUSD}` }}
            </span>
          </div>
        </v-card>
      </v-card>
    </v-card-text>

    <v-card-actions>
      <v-spacer/>
      <v-chip  
        color="#092457" 
        variant="outlined"
        size="large"
        block
        rounded="sm"
      >
       <i>Click on the Paypal button above to make Payment</i> 
      </v-chip>
      <v-spacer/>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { usePaymentsStore } from "@/stores/payments";
import { useRouter } from "vue-router";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

// Reactive references
const selectedAmount = ref(790); // default USD
const transactionEntity = ref("INDIVIDUAL");
const departmentId = ref("");
const success = ref<string | null>(null);
const error = ref<string | null>(null);
const paymentOption = ref("full");
const paypalLoading = ref(true);

// Computed properties for USD amounts
const baseAmountUSD = computed(() => selectedAmount.value);
const discountedAmountUSD = computed(() => (baseAmountUSD.value * 0.8).toFixed(2));
const totalAmountUSD = computed(() => discountedAmountUSD.value);
const installmentAmountUSD = computed(() => (parseFloat(discountedAmountUSD.value) / 2).toFixed(2));

const router = useRouter();
const store = usePaymentsStore();

// PayPal integration
onMounted(() => {
  initializePayPal();
});

const initializePayPal = () => {
  const script = document.createElement("script");
  script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
  script.async = true;
  document.body.appendChild(script);

  script.onload = () => {
    if ((window as any).paypal) {
      (window as any).paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "paypal",
            height: 45
          },

          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  referenceid: departmentId.value || "NEMBio Publication Credits",
                  description: "Publication Credits Purchase",
                  amount: {
                    currency_code: "USD",
                    value: paymentOption.value === 'installments' 
                      ? installmentAmountUSD.value 
                      : totalAmountUSD.value,
                  },
                },
              ],
            });
          },

          onApprove: async (data: any, actions: any) => {
            try {
              const details = await actions.order.capture();
              success.value = "Payment completed successfully!";

              const txnReference = details.id;

              await store.handleMakeAccessPaymentViaPaypal({
                userId: localStorage.getItem("sessionId"),
                departmentId: departmentId.value,
                transactionEntity: transactionEntity.value,
                paidAmount: paymentOption.value === 'installments' 
                  ? parseFloat(installmentAmountUSD.value) 
                  : parseFloat(totalAmountUSD.value),
                transactionReferenceNumber: txnReference,
              });

              router.push("/dashboard");
            } catch (err: any) {
              error.value = "Payment processing failed: " + err.message;
            }
          },

          onError: (err: any) => {
            error.value = "Payment error: " + err.message;
          },

          onInit: (data: any, actions: any) => {
            // PayPal button is initialized and ready
            paypalLoading.value = false;
          },
        })
        .render("#paypal-button-container");
    } else {
      error.value = "Payment service temporarily unavailable.";
      paypalLoading.value = false;
    }
  };

  script.onerror = () => {
    error.value = "Failed to load payment service.";
    paypalLoading.value = false;
  };
};
</script>

<style scoped>
#paypal-button-container {
  min-height: 45px;
  margin: 0.5rem 0;
}

.background-grey-lighten-3 {
  background-color: rgb(240, 240, 240);
}

.opacity-50 {
  opacity: 0.5;
}
</style>