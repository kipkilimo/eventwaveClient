<script setup lang="ts">
import { ref, defineAsyncComponent, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useOrganizationStore } from "@/stores/organization";

/* -----------------------------
   Router & Store
----------------------------- */
const route = useRoute();
const router = useRouter();
const orgStore = useOrganizationStore();

/* -----------------------------
   Types
----------------------------- */
interface DecodedPaymentData {
  invoiceVouchers: string[];
  totalAmount: number;
  orgId: string;
  timestamp: number;
  orgName?: string;
}

interface PaymentOrganization {
  id: string;
  name: string;
  isExternal: boolean;
}

interface PaymentOption {
  name: string;
  value: string;
  icon: string;
  component: unknown;
}

/* -----------------------------
   State
----------------------------- */
const decodedData = ref<DecodedPaymentData | null>(null);
const paymentOrganization = ref<PaymentOrganization | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const selectedPayment = ref("paypal");

/* -----------------------------
   Utils
----------------------------- */
const decodeBase64Url = (base64Url: string): string => {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);
  return decodeURIComponent(escape(atob(base64)));
};

/* -----------------------------
   Decode & Attach Org
----------------------------- */
const extractAndDecodeData = () => {
  try {
    const dataParam = route.query.data as string;
    if (!dataParam) throw new Error("No payment data found");

    const parsed: DecodedPaymentData = JSON.parse(decodeBase64Url(dataParam));
    decodedData.value = parsed;

    const existingOrg = orgStore.organizations.find(
      (o) => o.id === parsed.orgId
    );

    const orgName = parsed.orgName || existingOrg?.name || "TBD";

    paymentOrganization.value = {
      id: parsed.orgId,
      name: orgName,
      isExternal: !existingOrg,
    };

    if (existingOrg) {
      orgStore.currentOrganization = existingOrg;
    }
  } catch (err: any) {
    error.value = err.message || "Failed to decode payment data";
  } finally {
    isLoading.value = false;
  }
};

/* -----------------------------
   Lifecycle
----------------------------- */
onMounted(extractAndDecodeData);

/* -----------------------------
   Payment Payload
----------------------------- */
const getPaymentDataForComponent = () => ({
  invoiceVouchers: decodedData.value?.invoiceVouchers || [],
  totalAmount: decodedData.value?.totalAmount || 0,
  orgId: paymentOrganization.value?.id || "",

  orgName: paymentOrganization.value?.name || "",
  timestamp: decodedData.value?.timestamp || Date.now(),
  isExternalOrg: paymentOrganization.value?.isExternal ?? false,
  paymentOption: "full",
});

/* -----------------------------
   Async Components
----------------------------- */
const MPesaPayment = defineAsyncComponent(
  () => import("@/components/dialogs/payments/MpesaInputProPay.vue")
);
const PaypalPayment = defineAsyncComponent(
  () => import("@/components/dialogs/payments/PaypalInputProPay.vue")
);
const ChequePayment = defineAsyncComponent(
  () => import("@/components/dialogs/payments/ChequeInstructionsProPay.vue")
);

/* -----------------------------
   Payment Options
----------------------------- */
const paymentOptions: PaymentOption[] = [
  {
    name: "PayPal Express",
    value: "paypal",
    icon: "mdi-credit-card-fast",
    component: PaypalPayment,
  },
  {
    name: "M-Pesa Mobile",
    value: "mpesa",
    icon: "mdi-cellphone-link",
    component: MPesaPayment,
  },
  {
    name: "Cheque Payment",
    value: "cheque",
    icon: "mdi-bank-transfer",
    component: ChequePayment,
  },
];

/* -----------------------------
   Active Component
----------------------------- */
const activeComponent = computed(
  () => paymentOptions.find((p) => p.value === selectedPayment.value)?.component
);

/* -----------------------------
   Static User Info
----------------------------- */
const userData = {
  name: "Event Wave Interactive",
  email: "info@eventwave.dev",
  avatar: "https://cdn-icons-gif.flaticon.com/8721/8721045.gif",
};
</script>

<template>
  <v-card class="mx-auto payment-shell" elevation="5">
    <!-- Loading -->
    <div v-if="isLoading" class="text-center pa-10">
      <v-progress-circular indeterminate size="56" />
      <p class="mt-4 text-medium-emphasis">
        Loading payment information…
      </p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center pa-10">
      <v-icon size="56" color="error">mdi-alert-circle-outline</v-icon>
      <p class="mt-4 text-error">{{ error }}</p>
      <v-btn class="mt-4" color="primary" @click="router.push('/')">
        Return Home
      </v-btn>
    </div>

    <!-- Main -->
    <template v-else>
      <v-row no-gutters>
        <!-- Sidebar / Top -->
        <v-col cols="12" md="4" class="pa-4 sidebar">
          <v-list-item
            :prepend-avatar="userData.avatar"
            :title="userData.name"
            :subtitle="userData.email"
          />

          <!-- Mobile payment selector -->
          <v-slide-group class="mt-4 d-md-none" show-arrows>
            <v-slide-group-item
              v-for="p in paymentOptions"
              :key="p.value"
            >
              <v-chip
                class="mr-2"
                :color="selectedPayment === p.value ? 'primary' : undefined"
                :variant="selectedPayment === p.value ? 'flat' : 'outlined'"
                @click="selectedPayment = p.value"
              >
                <v-icon start size="18">{{ p.icon }}</v-icon>
                {{ p.name }}
              </v-chip>
            </v-slide-group-item>
              <v-divider class="my-0" />
          </v-slide-group>

          <!-- Desktop payment list -->
          <v-list nav class="mt-4 d-none d-md-block">
            <v-list-item
              v-for="p in paymentOptions"
              :key="p.value"
              :title="p.name"
              :prepend-icon="p.icon"
              :active="selectedPayment === p.value"
              rounded
              @click="selectedPayment = p.value"
            />
          </v-list>

          <!-- Organization -->
          <v-card class="mt-4 pa-4" color="blue-grey-lighten-5" rounded="lg">
            <strong class="text-caption">Paying For</strong>
            <div class="font-weight-medium">
              {{ paymentOrganization?.name }}
            </div>

            <v-chip
              v-if="paymentOrganization?.isExternal"
              size="small"
              color="orange"
              class="mt-2"
            >
              External Organization
            </v-chip>
          </v-card>

          <!-- Invoice Summary -->
          <v-card class="mt-4" variant="outlined" rounded="lg">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <strong>
                  Vouchers |  {{ decodedData?.invoiceVouchers.length }}
                  </strong>
                  invoice(s)
                </div>
                <div class="text-h6">
                  ${{ decodedData?.totalAmount.toFixed(2) }}
                </div>
              </div>

              <v-divider class="my-3" />

              <div class="d-flex flex-wrap">
                <v-chip
                  v-for="(voucher, index) in decodedData?.invoiceVouchers"
                  :key="index"
                  size="small"
                  class="mr-2 mb-2"
                  variant="outlined"
                  color="secondary"
                >
                  {{ voucher }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Payment Area -->
        <v-col cols="12" md="8" class="pa-4 payment-content">
          <component
            :is="activeComponent"
            :payment-data="getPaymentDataForComponent()"
          />
        </v-col>
      </v-row>
    </template>
    <!-- <v-card-actions>
    // add a button, ''
    </v-card-actions> -->
  </v-card>
</template>

<style scoped>
.payment-shell {
  max-width: 1100px;
}

@media (min-width: 960px) {
  .sidebar {
    border-inline-end: 1px solid
      rgba(var(--v-border-color), var(--v-border-opacity));
  }
}

@media (max-width: 600px) {
  .payment-content {
    padding-top: 0;
  }
}
</style>
