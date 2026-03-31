<template>
  <v-card class="mx-auto" elevation="5">

    <v-row no-gutters>

      <!-- LEFT PANEL -->
      <v-col cols="12" md="4" class="pa-2 border-e">

        <!-- HEADER -->
        <v-card flat class="mb-4">
          <v-list-item
            :prepend-avatar="userData.avatar"
            :subtitle="userData.email"
            :title="userData.name"
            class="pb-2"
          >
            <template #append>
              <v-icon color="primary" icon="mdi-rocket" size="large" />
            </template>
          </v-list-item>
        </v-card>

        <v-divider />

        <!-- PAYMENT OPTIONS -->
        <v-list density="comfortable" nav class="mt-2">

          <v-list-subheader class="font-weight-bold text-uppercase">
            <v-icon start icon="mdi-cash-multiple" size="small" />
            EventWave Business Plan Payment
          </v-list-subheader>

          <v-list-item
            v-for="option in paymentOptions"
            :key="option.value"
            :prepend-icon="option.icon"
            :title="option.name"
            :active="selectedPayment === option.value"
            @click="selectedPayment = option.value"
            rounded="lg"
            class="mb-1"
            color="primary"
          >
            <template #append>
              <v-icon
                :icon="selectedPayment === option.value
                  ? 'mdi-check-circle'
                  : 'mdi-chevron-right'"
                :color="selectedPayment === option.value ? 'success' : 'grey'"
              />
            </template>
          </v-list-item>

          <!-- ORGANIZATIONS -->
          <div class="mb-8">
            <p class="text-lg font-medium mb-3 text-gray-600">
              Choose One Organization:
            </p>

            <div class="text-center p-4 border rounded-sm bg-gray-50 border-gray-200">

              <v-chip
                v-for="org in orgStore.organizations"
                :key="org.id"
                size="x-small"
                class="ma-2 cursor-pointer"
                :color="getColor(org.isBlocked)"
                variant="elevated"
                @click="orgStore.currentOrganization = org"
              >
                <v-icon :icon="getIcon(org.isBlocked)" start />
                {{ org.name }}
              </v-chip>

            </div>
          </div>

          <!-- SELECTED ORGANIZATION -->
          <v-card
            class="p-4 rounded-lg shadow-md"
            :color="currentOrg ? 'blue-grey-lighten-5' : 'grey-lighten-3'"
          >

            <v-card-title
              class="text-xl font-semibold mb-2"
              :class="currentOrg ? 'text-blue-800' : 'text-gray-500'"
            >
              Paying for {{ currentOrg?.name || "No organization selected" }}
            </v-card-title>

            <v-card-text>
              <div v-if="currentOrg">
                <p><strong>Name:</strong> {{ currentOrg.name }}</p>

                <p class="mt-2">
                  <strong>Status:</strong>
                  <v-chip
                    :color="getColor(currentOrg.isBlocked)"
                    size="small"
                    class="ml-1"
                  >
                    <v-icon :icon="getIcon(currentOrg.isBlocked)" start />
                  </v-chip>
                </p>
              </div>

              <p v-else class="italic text-gray-500">
                Please select an organization.
              </p>
            </v-card-text>

          </v-card>

        </v-list>
      </v-col>

      <!-- RIGHT PANEL -->
      <v-col cols="12" md="8" class="pa-2">

        <component :is="activeComponent" />

        <div v-if="!activeComponent" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary" />
          <p class="text-caption mt-2">
            Loading...
            <v-icon icon="mdi-timer-sand-empty" size="small" />
          </p>
        </div>

      </v-col>

    </v-row>

  </v-card>
</template>
<script setup lang="ts">
import { ref, defineAsyncComponent, computed } from "vue";
import { useOrganizationStore } from "@/stores/organization";
import { useDialogStore, DIALOG_NAMES } from "@/stores/dialog";

const orgStore = useOrganizationStore();
const dialogStore = useDialogStore();

// --------------------
// PAYMENT COMPONENTS
// --------------------
const ChequePayment = defineAsyncComponent(
  () => import("@/components/dialogs/payments/ChequeInstructions.vue")
);
const MPesaPayment = defineAsyncComponent(
  () => import("@/components/dialogs/payments/MpesaInput.vue")
);
const PaypalPayment = defineAsyncComponent(
  () => import("@/components/dialogs/payments/PaypalInput.vue")
);
const Business = defineAsyncComponent(
  () => import("@/components/dialogs/payments/Business.vue")
);

// --------------------
// PAYMENT OPTIONS
// --------------------
interface PaymentOption {
  name: string;
  value: string;
  icon: string;
  component: any;
}

const paymentOptions: PaymentOption[] = [
  { name: "EventWave Business", value: "business", icon: "mdi-domain", component: Business },
  { name: "PayPal Express", value: "paypal", icon: "mdi-credit-card-fast", component: PaypalPayment },
  { name: "M-Pesa Mobile", value: "mpesa", icon: "mdi-cellphone-link", component: MPesaPayment },
  { name: "Cheque Payment", value: "cheque", icon: "mdi-bank-transfer", component: ChequePayment },
];

// --------------------
// STATE
// --------------------
const selectedPayment = ref("business");

// --------------------
// SAFE ORGANIZATION
// --------------------
const currentOrg = computed(() => orgStore.currentOrganization);

// --------------------
// ACTIVE PAYMENT COMPONENT
// --------------------
const activeComponent = computed(() => {
  const option = paymentOptions.find(
    (opt) => opt.value === selectedPayment.value
  );
  return option?.component || MPesaPayment;
});

// --------------------
// CHIP HELPERS
// --------------------
const getColor = (status: any) => {
  if (status === false) return "success";
  if (status === true) return "error";
  return "grey";
};

const getIcon = (status: any) => {
  if (status === false) return "mdi-lock-open-check-outline";
  if (status === true) return "mdi-block-helper";
  return "mdi-folder-question-outline";
};

// --------------------
// USER HEADER DATA
// --------------------
const userData = {
  name: "Event Wave Interactive",
  email: "info@eventwave.dev",
  avatar: "https://cdn-icons-gif.flaticon.com/8721/8721045.gif",
};

// --------------------
// OPEN PAYMENT DIALOG (OPTIONAL EXTENSION)
// --------------------
function openPaymentDialog() {
  dialogStore.open(DIALOG_NAMES.PAYMENT_DIALOG);
}
</script>