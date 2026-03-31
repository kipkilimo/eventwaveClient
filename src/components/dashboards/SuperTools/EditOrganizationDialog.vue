<template>
  <v-card v-if="orgStore.currentOrganization">
    <v-card-title class="d-flex align-center bg-blue-grey-lighten-5">
      <v-icon icon="mdi-pencil" class="mr-2"></v-icon>
      Edit Organization - {{ orgStore.currentOrganization.name }}
      <v-spacer></v-spacer>
      <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
    </v-card-title>
    <v-card-text>
      <v-form v-model="valid" @submit.prevent="saveOrganization">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field 
              v-model="form.name" 
              label="Organization Name" 
              variant="outlined" 
              :rules="[v => !!v || 'Name is required']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field 
              v-model="form.email" 
              label="Email" 
              type="email" 
              variant="outlined" 
              :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6">
            <v-select 
              v-model="form.orgType" 
              label="Organization Type" 
              :items="orgTypes" 
              variant="outlined"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select 
              v-model="form.subscriptionTier" 
              label="Subscription Tier" 
              :items="subscriptionTiers" 
              variant="outlined"
            ></v-select>
          </v-col>
        </v-row> 
        <v-row>
          <v-col cols="12">
            <v-switch 
              v-model="form.isBlocked" 
              :label="form.isBlocked ? 'Blocked: Yes (Click to Unblock)' : 'Blocked: No (Click to Block)'" 
              :color="form.isBlocked ? 'error' : 'success'" 
              hide-details
            ></v-switch>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="closeDialog" variant="text">Cancel</v-btn>
      <v-btn @click="saveOrganization" color="primary" :loading="saving" :disabled="!valid">
        Save Changes
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useOrganizationStore } from '@/stores/organization'

const orgStore = useOrganizationStore();
const emit = defineEmits(['saved']);

const valid = ref(false);
const saving = ref(false);
const form = reactive({
  name: '', 
  email: '', 
  orgType: '', 
  subscriptionTier: '',  
  isBlocked: false
});

const orgTypes = ['HOTEL', 'GOVERNMENT', 'NGO', 'CBO', 'PRIVATE', 'BUSINESS'];
const subscriptionTiers = ['FREE', 'PRO', 'BUSINESS'];

 

const saveOrganization = async () => {
  if (!valid.value) return;
  saving.value = true;
  try {
    // Simulate GraphQL mutation: updateOrganization(input: UpdateOrganizationInput!)
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Simulating GraphQL mutation to update organization:', {
      id: orgStore.currentOrganization.id,
      name: form.name,
      email: form.email,
      orgType: form.orgType,
      subscriptionTier: form.subscriptionTier,  
      isBlocked: form.isBlocked 
    });
    emit('saved');
  } catch (error) {
    console.error('Failed to save organization:', error);
  } finally {
    saving.value = false;
  }
};

const closeDialog = () => {
  orgStore.closeDialog('edit');
};
</script>