<template>
  <v-card v-if="organization">
    <v-card-title class="d-flex align-center bg-blue-grey-lighten-5">
      <v-icon icon="mdi-receipt" class="mr-2"></v-icon>
      Invoices - {{ orgStore.currentOrganization.name }} ({{ orgStore.currentOrganization.invoices.length }})
      <v-spacer></v-spacer>
      <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
    </v-card-title>
    <v-card-text>
      <v-alert 
        v-if="orgStore.currentOrganization.invoices.length === 0" 
        type="info" 
        variant="tonal"
      >
        No invoices found for this organization.
      </v-alert>
      <v-data-table 
        v-else 
        :headers="invoiceHeaders" 
        :items="orgStore.currentOrganization.invoices" 
        class="elevation-1"
      >
        <template v-slot:item.amount="{ item }">
          {{ formatCurrency(item.amount) }}
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status, 'invoice')" size="small">
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
        <template v-slot:item.dueDate="{ item }">
          {{ formatDate(item.dueDate) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn 
            icon 
            variant="text" 
            size="small" 
            :disabled="item.status === 'DRAFT'"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
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
import { computed } from 'vue'
import { useOrganizationStore } from '@/stores/organization'

const orgStore = useOrganizationStore();


// Use the selected organization from store with computed
const organization = computed(() => orgStore.selectedOrganization);
const invoiceHeaders = [
  { title: 'Invoice ID', key: 'id' }, 
  { title: 'Date', key: 'createdAt' }, 
  { title: 'Amount', key: 'amount' },
  { title: 'Status', key: 'status' }, 
  { title: 'Due Date', key: 'dueDate' }, 
  { title: 'Actions', key: 'actions', sortable: false }
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
  orgStore.closeDialog('invoices');
};
</script>