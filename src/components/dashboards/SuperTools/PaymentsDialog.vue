<template>
  <v-card v-if="organization">
    <v-card-title class="d-flex align-center bg-blue-grey-lighten-5">
      <v-icon icon="mdi-credit-card" class="mr-2"></v-icon>
      Payments - {{ orgStore.currentOrganization.name }} ({{ orgStore.currentOrganization.payments.length }})
      <v-spacer></v-spacer>
      <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
    </v-card-title>
    <v-card-text>
      <v-alert 
        v-if="orgStore.currentOrganization.payments.length === 0" 
        type="info" 
        variant="tonal"
      >
        No payment records found for this organization.
      </v-alert>
      <v-data-table 
        v-else 
        :headers="paymentHeaders" 
        :items="orgStore.currentOrganization.payments" 
        class="elevation-1"
      >
        <template v-slot:item.amount="{ item }">
          {{ formatCurrency(item.amount) }}
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status, 'payment')" size="small">
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
        <template v-slot:item.paymentMethod="{ item }">
          <div class="d-flex align-center">
            <v-icon :icon="getPaymentMethodIcon(item.paymentMethod)" class="mr-2"></v-icon>
            {{ item.paymentMethod }}
          </div>
        </template>
      </v-data-table>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="closeDialog" color="primary">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>

import {  computed } from 'vue'
import { useOrganizationStore } from '@/stores/organization'
const orgStore = useOrganizationStore();



// Use the selected organization from store with computed
const organization = computed(() => orgStore.selectedOrganization);
const paymentHeaders = [
  { title: 'Payment ID', key: 'id' }, 
  { title: 'Date', key: 'createdAt' }, 
  { title: 'Amount', key: 'amount' },
  { title: 'Method', key: 'paymentMethod' }, 
  { title: 'Status', key: 'status' }, 
  { title: 'Reference', key: 'reference' }
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const getStatusColor = (status, type) => {
  const colors = type === 'invoice' 
    ? { PAID: 'success', PENDING: 'warning', OVERDUE: 'error', DRAFT: 'grey' }
    : { COMPLETED: 'success', PENDING: 'warning', FAILED: 'error', REFUNDED: 'info' };
  return colors[status] || 'grey';
};

const getPaymentMethodIcon = (method) => {
  const icons = { 
    CARD: 'mdi-credit-card', 
    BANK_TRANSFER: 'mdi-bank', 
    PAYPAL: 'mdi-paypal', 
    MOBILE_MONEY: 'mdi-cellphone' 
  };
  return icons[method] || 'mdi-cash';
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const closeDialog = () => {
  orgStore.closeDialog('payments');
};
</script>