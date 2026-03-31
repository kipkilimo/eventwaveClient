<template>
  <v-card v-if="organization">
    <v-card-title class="d-flex align-center bg-blue-grey-lighten-5">
      <v-icon icon="mdi-domain" class="mr-2"></v-icon>
      {{ organization.name }} Details
      <v-spacer></v-spacer>
      <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1">Subscription & Limits</v-card-title>
            <v-list density="compact">
              <v-list-item title="Subscription Tier" :subtitle="organization.subscriptionTier || 'Not set'">
                <template v-slot:append>
                  <v-chip :color="getTierColor(organization.subscriptionTier)" size="small">
                    {{ organization.subscriptionTier || 'N/A' }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-list-item title="Status" :subtitle="organization.isBlocked ? 'Blocked' : 'Active'">
                <template v-slot:append>
                  <v-chip :color="organization.isBlocked ? 'error' : 'success'" size="small">
                    {{ organization.isBlocked ? 'Blocked' : 'Active' }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-list-item 
                title="Next Billing Date" 
                :subtitle="formatDate(organization.nextBillingDate) || 'Not set'" 
              />
              <v-list-item 
                title="Max Events" 
                :subtitle="organization.maxEvents || 'Unlimited'" 
              />
              <v-list-item 
                title="Max Participants" 
                :subtitle="organization.maxParticipants || 'Unlimited'" 
              />
            </v-list>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1">
              Administrators ({{ organization.admins?.length || 0 }})
            </v-card-title>
            <v-list density="compact">
              <v-list-item 
                v-for="admin in organization.admins || []" 
                :key="admin.id" 
                :title="admin.name || 'Unknown'" 
                :subtitle="admin.email || 'No email'" 
                prepend-icon="mdi-account-tie" 
              />
              <v-list-item 
                v-if="!organization.admins || organization.admins.length === 0"
                title="No administrators found"
                subtitle="This organization has no assigned admins"
                prepend-icon="mdi-account-off"
              />
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="closeDialog" color="primary">Close</v-btn>
    </v-card-actions>
  </v-card>

  <!-- Loading/Error State -->
  <v-card v-else>
    <v-card-title class="d-flex align-center bg-blue-grey-lighten-5">
      <v-icon icon="mdi-domain" class="mr-2"></v-icon>
      Organization Details
      <v-spacer></v-spacer>
      <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
    </v-card-title>
    <v-card-text class="text-center py-8">
      <v-progress-circular
        v-if="loading"
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <div v-else>
        <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
        <div class="text-h6 text-error">Organization not found</div>
        <div class="text-body-1 mt-2">The requested organization could not be loaded.</div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="closeDialog" color="primary">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useOrganizationStore } from '@/stores/organization'

const orgStore = useOrganizationStore();
const loading = ref(true);

// Use the selected organization from store with computed
const organization = computed(() => orgStore.selectedOrganization);

const getTierColor = (tier) => {
  if (!tier) return 'grey';
  const colors = { 
    FREE: 'grey', 
    PRO: 'primary', 
    BUSINESS: 'secondary',
    ENTERPRISE: 'teal'
  };
  return colors[tier] || 'grey';
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const closeDialog = () => {
  orgStore.closeDialog('details');
};

// Handle component lifecycle
onMounted(() => {
  // Simulate loading delay for better UX
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>