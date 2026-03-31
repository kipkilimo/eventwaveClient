<template>
  <v-card elevation="1" class="pa-4" v-if="org">
    <!-- HEADER -->
    <div class="d-flex align-center mb-4">
      <v-avatar color="primary" size="48" class="mr-3">
        <span class="white--text text-h6">{{ orgInitial }}</span>
      </v-avatar>
      <div>
        <div class="text-h6 font-weight-bold">{{ org.name }}</div>
        <div class="text-subtitle-2 text-grey">{{ org.orgType || "N/A" }}</div>
      </div>
    </div>

    <v-divider></v-divider>

    <!-- CONTACT -->
    <div class="my-3 d-flex align-center">
      <v-icon size="18" color="blue" class="mr-2">mdi-email</v-icon>
      <span class="text-body-2">{{ org.email }}</span>
    </div>

    <!-- SUBSCRIPTION -->
    <div class="mb-3">
      <v-chip
        size="small"
        color="indigo-lighten-4"
        class="text-indigo"
        variant="outlined"
      >
        Tier: {{ org.subscriptionTier || "Free" }}
      </v-chip>
    </div>

    <v-divider></v-divider>

    <!-- CAPACITY -->
    <div class="my-3">
      <div class="text-body-2"><strong>Max Events:</strong> {{ org.maxEvents }}</div>
      <div class="text-body-2"><strong>Max Participants:</strong> {{ org.maxParticipants }}</div>
    </div>

    <v-divider></v-divider>

    <!-- STATS -->
    <div class="my-3">
      <div class="text-body-2"><strong>Users:</strong> {{ userCount }}</div>
      <div class="text-body-2"><strong>Admins:</strong> {{ adminCount }}</div>
      <div class="text-body-2"><strong>Events:</strong> {{ eventCount }}</div>
      <div class="text-body-2"><strong>Invoices:</strong> {{ invoiceCount }}</div>
      <div class="text-body-2"><strong>Payments:</strong> {{ paymentCount }}</div>
    </div>

    <v-divider></v-divider>

    <!-- BILLING INFO -->
    <div v-if="org.billingAccount" class="my-3">
      <div class="text-body-2"><strong>Billing Tier:</strong> {{ org.billingAccount.tier }}</div>
      <div class="text-body-2"><strong>Threshold USD:</strong> {{ org.billingAccount.thresholdUSD }}</div>
      <div class="text-body-2"><strong>Accumulated Unbilled USD:</strong> {{ org.billingAccount.accumulatedUnbilledUSD }}</div>
      <div class="text-body-2"><strong>Last Charged At:</strong> {{ formatDate(org.billingAccount.lastChargedAt) }}</div>
      <div class="text-body-2"><strong>Credit Limit USD:</strong> {{ org.billingAccount.creditLimitUSD ?? "N/A" }}</div>
      <div class="text-body-2"><strong>Billing Status:</strong> {{ org.billingAccount.billingStatus }}</div>
      <div class="text-body-2"><strong>Dunning Retries:</strong> {{ org.billingAccount.dunningState?.retries ?? 0 }}</div>
      <div class="text-body-2"><strong>Last Attempt:</strong> {{ formatDate(org.billingAccount.dunningState?.lastAttempt) }}</div>
    </div>

    <v-divider></v-divider>

    <!-- FOOTER -->
    <div class="mt-3 text-caption text-grey">
      <div>Created: {{ formatDate(org.createdAt) }}</div>
      <div>Last Updated: {{ formatDate(org.updatedAt) }}</div>
    </div>
  </v-card>

  <div v-else class="text-center py-6 text-grey">No organization selected</div>
</template>

<script setup>
import { computed } from "vue";
import { useOrganizationStore } from "@/stores/organization";
import { DateTime } from "luxon";

// ---------------------------
// Organization Store
// ---------------------------
const orgStore = useOrganizationStore();

// ---------------------------
// Selected organization
// ---------------------------
const org = computed(() => orgStore.currentOrganization);

// ---------------------------
// Computed stats
// ---------------------------
const orgInitial = computed(() => org.value?.name?.charAt(0).toUpperCase() || "?");
const userCount = computed(() => org.value?.users?.length ?? 0);
const adminCount = computed(() => org.value?.admins?.length ?? 0);
const eventCount = computed(() => org.value?.events?.length ?? 0);
const invoiceCount = computed(() => org.value?.invoices?.length ?? 0);
const paymentCount = computed(() => org.value?.payments?.length ?? 0);

// ---------------------------
// Format dates with Luxon
// ---------------------------
const formatDate = (date) => {
  if (!date) return "N/A";
  const dt = typeof date === "string" ? DateTime.fromISO(date) : DateTime.fromJSDate(date);
  return dt.toLocaleString(DateTime.DATE_MED); // e.g., "21 Nov 2025"
};
</script>

<style scoped>
.text-body-2 {
  margin-bottom: 4px;
}
</style>
