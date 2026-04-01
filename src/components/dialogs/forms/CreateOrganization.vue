<template>
  <v-card
    class="org-card py-6 px-5 mx-auto my-6 position-relative"
    elevation="10"
    max-width="55rem"
  >
    <!-- CLOSE BUTTON -->
    <v-btn
      icon
      variant="text"
      size="small"
      class="close-btn"
      @click="closeDialog"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>

    <v-card-title class="text-h6 font-weight-bold pb-1">
      {{ isEdit ? "Edit Organization" : "Create New Organization" }}
    </v-card-title>

    <v-divider class="mb-4" />

    <v-card-text>
      <!-- SUCCESS ALERT -->
      <v-alert
        v-if="success"
        type="success"
        variant="tonal"
        density="compact"
        class="mb-4 fade-in"
        @click="success = null"
        style="cursor: pointer"
      >
        {{ success }}
      </v-alert>

      <!-- ERROR ALERT -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4 shake"
        @click="error = null"
        style="cursor: pointer"
      >
        {{ error }}
      </v-alert>

      <!-- AUTO-VERIFICATION INFO (ADMIN/SUPER only) -->
      <v-alert
        v-if="!isEdit && isAdminOrSuper"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        <div class="d-flex align-center">
          <v-icon left class="mr-2">mdi-shield-check</v-icon>
          <span>
            As {{ userRole }}, this organization will be automatically verified
            and approved. No additional steps required.
          </span>
        </div>
      </v-alert>

      <!-- V-STEPPER FORM - Aligned with new structure -->
      <div class="fade-in">
        <v-stepper
          v-model="currentStep"
          :items="steps"
          show-actions
          class="mb-2"
        >
          <!-- Step 1: Basic Information -->
          <template v-slot:item.1>
            <v-form ref="basicForm" v-model="basicValid">
              <h3 class="text-title-large my-0">Basic Info</h3>
              
              <br>
              
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.name"
                    label="Organization Name *"
                    :rules="nameRules"
                    required
                    density="compact"
                    prepend-icon="mdi-domain"
                    rounded="sm"
                    :disabled="isFormDisabled"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.email"
                    label="Email *"
                    :rules="emailRules"
                    type="email"
                    required
                    density="compact"
                    prepend-icon="mdi-email"
                    rounded="sm"
                    :disabled="isFormDisabled"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-form>
          </template>

          <!-- Step 2: Contact Information -->
          <template v-slot:item.2>
            <v-form ref="contactForm" v-model="contactValid">
              <h3 class="text-title-large my-0">Contacts</h3>
              
              <br>
              
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.phone"
                    label="Phone *"
                    density="compact"
                    prepend-icon="mdi-phone"
                    rounded="sm"
                    :disabled="isFormDisabled"
                    :rules="phoneRules"
                    placeholder="+1234567890"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.website"
                    label="Website"
                    density="compact"
                    :rules="websiteRules"
                    prepend-icon="mdi-web"
                    rounded="sm"
                    :disabled="isFormDisabled"
                    hint="Optional, but recommended"
                    persistent-hint
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.address"
                    label="Address"
                    density="compact"
                    prepend-icon="mdi-map-marker"
                    rounded="sm"
                    :disabled="isFormDisabled"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-form>
          </template>

          <!-- Step 3: Organization Type -->
          <template v-slot:item.3>
            <div>
              <h3 class="text-title-large my-0">Org type</h3>
              
              <br>
              
              <div class="d-flex align-center mb-2">
                <v-icon size="20" class="mr-2" color="#850a85">mdi-shape</v-icon>
                <span class="text-subtitle-1 font-weight-medium">Select Organization Type *</span>
                <v-chip
                  v-if="formData.orgType && !isFormDisabled"
                  size="small"
                  color="#850a85"
                  variant="flat"
                  class="ml-2"
                  @click="formData.orgType = ''"
                  closable
                  @click:close="formData.orgType = ''"
                >
                  {{ truncateText(formData.orgType, 30) }}
                </v-chip>
              </div>

              <div class="chips-container">
                <v-tooltip
                  v-for="vertical in orgTypeOptions"
                  :key="vertical.vertical"
                  location="top"
                  :open-delay="300"
                  :close-delay="100"
                >
                  <template #activator="{ props: tooltipProps }">
                    <v-chip
                      v-bind="tooltipProps"
                      :color="formData.orgType === vertical.vertical ? '#850a85' : 'default'"
                      :variant="formData.orgType === vertical.vertical ? 'flat' : 'outlined'"
                      class="org-type-chip"
                      size="small"
                      @click="!isFormDisabled && selectOrgType(vertical.vertical)"
                      :disabled="isFormDisabled"
                    >
                      <v-icon v-if="formData.orgType === vertical.vertical" start size="18">mdi-check-circle</v-icon>
                      {{ truncateText(vertical.vertical, 30) }}
                    </v-chip>
                  </template>
                  <div class="tooltip-content">
                    <strong class="d-block mb-1">{{ vertical.vertical }}</strong>
                    <v-divider />
                    <span class="text-caption">{{ vertical.useCase }}</span>
                  </div>
                </v-tooltip>
              </div>

              <v-alert
                v-if="orgTypeError && !isFormDisabled"
                type="error"
                variant="tonal"
                density="compact"
                class="mt-2"
                style="font-size: 0.75rem"
              >
                Please select an organization type
              </v-alert>
            </div>
          </template>

          <!-- Step 4: Billing & Limits (Admin/Super only) -->
          <template v-if="isAdminOrSuper" v-slot:item.4>
            <v-form ref="billingForm" v-model="billingValid">
              <h3 class="text-title-large my-0">Billing & Limits</h3>
              
              <br>
              
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="formData.subscriptionTier"
                    label="Subscription Tier *"
                    :items="subscriptionTierOptions"
                    density="compact"
                    prepend-icon="mdi-trophy"
                    rounded="sm"
                    :disabled="isFormDisabled"
                    :rules="[(v) => !!v || 'Subscription tier is required']"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    v-model="formData.billingCycle"
                    label="Billing Cycle"
                    :items="billingCycleOptions"
                    density="compact"
                    prepend-icon="mdi-calendar-clock"
                    rounded="sm"
                    :disabled="isFormDisabled"
                    hint="Only applies to paid tiers"
                    persistent-hint
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.billingEmail"
                    label="Billing Email"
                    type="email"
                    density="compact"
                    prepend-icon="mdi-email-outline"
                    rounded="sm"
                    :disabled="isFormDisabled"
                    :rules="billingEmailRules"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.taxId"
                    label="Tax ID / VAT Number"
                    density="compact"
                    prepend-icon="mdi-identifier"
                    rounded="sm"
                    :disabled="isFormDisabled"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.billingAddress"
                    label="Billing Address"
                    density="compact"
                    prepend-icon="mdi-map-marker-outline"
                    rounded="sm"
                    :disabled="isFormDisabled"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.registrationNumber"
                    label="Registration Number"
                    density="compact"
                    prepend-icon="mdi-bank"
                    rounded="sm"
                    :disabled="isFormDisabled"
                    hint="Company registration number (if applicable)"
                    persistent-hint
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12">
                  <v-switch
                    v-model="formData.autoRenew"
                    label="Auto-renew subscription"
                    density="compact"
                    color="#850a85"
                    :disabled="isFormDisabled"
                    hide-details
                  />
                </v-col>
              </v-row>

              <!-- Custom Limits Section (Edit mode only) -->
              <template v-if="isEdit">
                <v-divider class="my-4" />

                <div class="section-title mb-3">
                  <v-icon size="20" class="mr-2" color="#850a85">mdi-gauge</v-icon>
                  <span class="text-subtitle-1 font-weight-medium">
                    Custom Limits (Override tier defaults)
                  </span>
                </div>

                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.maxEvents"
                      label="Max Events"
                      type="number"
                      density="compact"
                      prepend-icon="mdi-calendar"
                      rounded="sm"
                      :disabled="isFormDisabled"
                      :rules="[(v) => !v || v >= 0 || 'Must be non-negative']"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.maxParticipantsPerEvent"
                      label="Max Participants per Event"
                      type="number"
                      density="compact"
                      prepend-icon="mdi-account-group"
                      rounded="sm"
                      :disabled="isFormDisabled"
                      :rules="[(v) => !v || v >= 0 || 'Must be non-negative']"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.maxConcurrentEvents"
                      label="Max Concurrent Events"
                      type="number"
                      density="compact"
                      prepend-icon="mdi-calendar-multiple"
                      rounded="sm"
                      :disabled="isFormDisabled"
                      :rules="[(v) => !v || v >= 0 || 'Must be non-negative']"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.maxStorageGB"
                      label="Max Storage (GB)"
                      type="number"
                      density="compact"
                      prepend-icon="mdi-database"
                      rounded="sm"
                      :disabled="isFormDisabled"
                      :rules="[(v) => !v || v >= 0 || 'Must be non-negative']"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </template>
            </v-form>
          </template>

          <!-- Step 5: Enterprise Features (Admin/Super + Enterprise tier only) -->
          <template v-if="isAdminOrSuper && formData.subscriptionTier === 'ENTERPRISE'" v-slot:item.5>
            <div>
              <h3 class="text-title-large my-0">Enterprise Features</h3>
              
              <br>
              
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.customDomain"
                    label="Custom Domain"
                    density="compact"
                    prepend-icon="mdi-domain"
                    rounded="sm"
                    :disabled="isFormDisabled"
                    hint="e.g., events.yourcompany.com"
                    persistent-hint
                    variant="outlined"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-switch
                    v-model="formData.ssoEnabled"
                    label="Enable Single Sign-On (SSO)"
                    density="compact"
                    color="#850a85"
                    :disabled="isFormDisabled"
                    hide-details
                  />

                  <v-switch
                    v-model="formData.dedicatedSupport"
                    label="Dedicated Support"
                    density="compact"
                    color="#850a85"
                    :disabled="isFormDisabled"
                    hide-details
                    class="mt-2"
                  />

                  <v-switch
                    v-model="formData.apiAccessEnabled"
                    label="API Access"
                    density="compact"
                    color="#850a85"
                    :disabled="isFormDisabled"
                    hide-details
                    class="mt-2"
                  />

                  <v-text-field
                    v-model="formData.webhookUrl"
                    label="Webhook URL"
                    density="compact"
                    prepend-icon="mdi-webhook"
                    rounded="sm"
                    :disabled="isFormDisabled"
                    hint="URL for receiving webhook notifications"
                    persistent-hint
                    variant="outlined"
                    class="mt-2"
                  />
                </v-col>
              </v-row>
            </div>
          </template>
        </v-stepper>
      </div>
    </v-card-text>

    <v-divider class="my-2" />

    <v-card-actions class="justify-end">
      <v-btn
        variant="text"
        color="#800080"
        @click="resetForm"
        :disabled="saving || loading"
      >
        Clear
      </v-btn>

      <v-btn
        variant="text"
        color="#800080"
        @click="closeDialog"
        :disabled="saving || loading"
      >
        Cancel
      </v-btn>

      <v-btn
        color="#800080"
        variant="flat"
        :loading="loading"
        :disabled="!validateAllSteps() || loading || saving"
        @click="save"
      >
        {{ isEdit ? "Update Organization" : "Create Organization" }}
      </v-btn>
    </v-card-actions>
    <v-dialog persistent="1" v-model="showUploader">
    <legal-docs/>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, reactive, watch, computed, onUnmounted } from "vue";
import axios from "axios";
import { useOrganizationStore } from "@/stores/organization";
import { useUserStore } from "@/stores/user";
import { DIALOG_NAMES, useDialogStore } from "@/stores/dialog";
import { orgTypes } from "@/data/orgType"; 
import LegalDocs from "../uploads/pdf/LegalDocs.vue";

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  payload: {
    type: Object,
    default: null,
  },
});

// Emits
const emit = defineEmits(["close", "success"]);

// Stores
const orgStore = useOrganizationStore();
const userStore = useUserStore();
const dialogStore = useDialogStore();

// API URL
const apiUrl = import.meta.env.VITE_API_URL;

// Stepper state
const currentStep = ref(1);
const basicValid = ref(false);
const contactValid = ref(false);
const billingValid = ref(false);

// Form references
const basicForm = ref(null);
const contactForm = ref(null);
const billingForm = ref(null);

// Computed
const isEdit = computed(() => !!orgStore.currentOrganization);
const isAdminOrSuper = computed(() => {
  const role = userStore.user?.role;
  return role === "ADMIN" || role === "SUPER";
});
const userRole = computed(() => {
  const role = userStore.user?.role;
  if (role === "SUPER") return "Super Admin";
  if (role === "ADMIN") return "Admin";
  return "User";
});
const isFormDisabled = computed(() => loading.value || saving.value);

// Steps configuration
const steps = computed(() => {
  const baseSteps = ['Basic Info', 'Contacts', 'Organization Type'];
  if (isAdminOrSuper.value) {
    baseSteps.push('Billing & Limits');
  }
  if (isAdminOrSuper.value && formData.subscriptionTier === 'ENTERPRISE') {
    baseSteps.push('Enterprise Features');
  }
  return baseSteps;
});

const validateAllSteps = () => {
  let isValid = basicValid.value && contactValid.value && !!formData.orgType;
  
  if (isAdminOrSuper.value) {
    isValid = isValid && billingValid.value;
  }
  
  return isValid;
};

// ============================================
// UPLOADER VISIBILITY LOGIC
// ============================================
const allowedRoles = ["PARTICIPANT", "FACILITATOR"];

// Show uploader section only when editing an existing organization
const  showUploader=ref(false)

// Check if user can upload
const canUpload = computed(() => {
  const userRole = userStore.user?.role || "";
  
  return (
    !!orgStore.currentOrganization && // org exists and loaded
    allowedRoles.includes(userRole) // role is allowed
  );
});

const createdOrgName = computed(() => orgStore.currentOrganization?.name || "Organization");

// ============================================
// UPLOADER STATE
// ============================================
const uploaderFile = ref([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const isUploadSuccessful = ref(false);
const uploaderError = ref(null);

// ============================================
// ORGANIZATION FORM STATE
// ============================================
const success = ref(null);
const error = ref(null);
const orgTypeError = ref(false);
const form = ref(null);
const valid = ref(false);
const saving = ref(false);
const loading = ref(false);

// Default data aligned with SDL
const defaultData = {
  // Basic info
  name: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  orgType: "",
  
  // Billing
  subscriptionTier: "FREE",
  billingCycle: "MONTHLY",
  billingEmail: "",
  billingAddress: "",
  taxId: "",
  registrationNumber: "",
  autoRenew: true,
  paymentMethodId: "",
  
  // Custom limits
  maxEvents: null,
  maxParticipantsPerEvent: null,
  maxConcurrentEvents: null,
  maxStorageGB: null,
  
  // Enterprise features
  customDomain: "",
  ssoEnabled: false,
  apiAccessEnabled: false,
  webhookUrl: "",
  dedicatedSupport: false,
  customSLA: false,
};

// Reactive form
const formData = reactive({ ...defaultData });

// Reset form
const resetForm = () => {
  if (basicForm.value) basicForm.value.resetValidation();
  if (contactForm.value) contactForm.value.resetValidation();
  if (billingForm.value) billingForm.value.resetValidation();
  
  Object.assign(formData, JSON.parse(JSON.stringify(defaultData)));
  success.value = null;
  error.value = null;
  orgTypeError.value = false;
  basicValid.value = false;
  contactValid.value = false;
  billingValid.value = false;
  currentStep.value = 1;
  
  // Reset uploader state
  uploaderFile.value = [];
  uploaderError.value = null;
  isUploadSuccessful.value = false;
  uploading.value = false;
  uploadProgress.value = 0;
};

// Select organization type
const selectOrgType = (vertical) => {
  if (isFormDisabled.value) return;
  formData.orgType = vertical;
  orgTypeError.value = false;
};

// ============================================
// CLOSE DIALOG (BEST PRACTICE)
// ============================================
/* -----------------------------
   REACTIVE DIALOG STATES
------------------------------ */
const showOrganizationForm = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.CREATE_ORGANIZATION),
  set: (val) => {
    if (!val) dialogStore.close(DIALOG_NAMES.CREATE_ORGANIZATION);
  },
});

// Load edit data
watch(
  () => orgStore.currentOrganization,
  (org) => {
    if (!org) {
      resetForm();
      return;
    }

    resetForm();

    // Map model fields to form data
    const mapping = {
      name: "name",
      email: "email",
      phone: "phone",
      address: "address",
      website: "website",
      orgType: "orgType",
      subscriptionTier: "subscriptionTier",
      billingCycle: "billingCycle",
      billingEmail: "billingEmail",
      billingAddress: "billingAddress",
      taxId: "taxId",
      registrationNumber: "registrationNumber",
      autoRenew: "autoRenew",
      maxEvents: "maxEvents",
      maxParticipantsPerEvent: "maxParticipantsPerEvent",
      maxConcurrentEvents: "maxConcurrentEvents",
      maxStorageGB: "maxStorageGB",
      customDomain: "customDomain",
      ssoEnabled: "ssoEnabled",
      apiAccessEnabled: "apiAccessEnabled",
      webhookUrl: "webhookUrl",
      dedicatedSupport: "dedicatedSupport",
      customSLA: "customSLA",
    };

    Object.keys(mapping).forEach((modelKey) => {
      const formKey = mapping[modelKey];
      if (org[modelKey] !== undefined && org[modelKey] !== null) {
        formData[formKey] = org[modelKey];
      }
    });

    // Handle quotas object
    if (org.quotas) {
      if (org.quotas.eventsLimit && !formData.maxEvents) {
        formData.maxEvents = org.quotas.eventsLimit;
      }
      if (org.quotas.participantsLimit && !formData.maxParticipantsPerEvent) {
        formData.maxParticipantsPerEvent = org.quotas.participantsLimit;
      }
      if (org.quotas.concurrentEventsLimit && !formData.maxConcurrentEvents) {
        formData.maxConcurrentEvents = org.quotas.concurrentEventsLimit;
      }
      if (org.quotas.storageLimitGB && !formData.maxStorageGB) {
        formData.maxStorageGB = org.quotas.storageLimitGB;
      }
    }

    if (formData.orgType) {
      valid.value = true;
    }
    
    // Set valid flags for stepper
    basicValid.value = !!formData.name && !!formData.email;
    contactValid.value = !!formData.phone;
    billingValid.value = true; // Billing fields are optional
  },
  { immediate: true, deep: true },
);

// Truncate text
const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Save organization
// Define showUploader ref 

const save = async () => {
  if (isFormDisabled.value) return;

  error.value = null;
  success.value = null;
  loading.value = true;

  try {
    // Validate all forms
    const validations = await validateForms();
    if (!validations.isValid) {
      error.value = validations.errorMessage;
      currentStep.value = validations.errorStep;
      loading.value = false;
      return;
    }

    // Validate required fields
    const requiredFieldsValid = validateRequiredFields();
    if (!requiredFieldsValid.isValid) {
      error.value = requiredFieldsValid.errorMessage;
      currentStep.value = requiredFieldsValid.errorStep;
      loading.value = false;
      return;
    }

    // Validate user authentication
    if (!userStore.user?.id && !isAdminOrSuper.value) {
      error.value = "User not found. Please login again.";
      loading.value = false;
      return;
    }

    saving.value = true;
    let createdOrganization = null;

    // Prepare base payload
    const basePayload = getBasePayload();

    // Execute organization operation based on mode and role
    if (isEdit.value) {
      createdOrganization = await updateOrganization(basePayload);
      // For editing, show uploader if organization exists
      if (createdOrganization) {
        showUploader.value = true;
      }
    } else {
      createdOrganization = await createOrganization(basePayload);
      
      // Show file upload dialog for regular users after standard creation
      if (!isAdminOrSuper.value && !isEdit.value) {
        showUploader.value = true;
        loading.value = false;
        saving.value = false;
        return; // Exit early to show upload dialog
      }
    }

    // Handle success flow
    await handleSuccess(createdOrganization);
    
    // Auto-close after success (if no uploader is shown)
    if (!showUploader.value) {
      setTimeout(() => {
        closeDialog();
      }, 2000);
    }
    
  } catch (err) {
    console.error("Organization operation error:", err);
    error.value = err.message || "Operation failed. Please try again.";
  } finally {
    saving.value = false;
    loading.value = false;
  }
};

// Helper functions
const validateForms = async () => {
  // Basic form validation
  if (basicForm.value) {
    const result = await basicForm.value.validate();
    if (!result?.valid) {
      return {
        isValid: false,
        errorMessage: "Please fix validation errors in Basic Information.",
        errorStep: 1
      };
    }
  }

  // Contact form validation
  if (contactForm.value) {
    const result = await contactForm.value.validate();
    if (!result?.valid) {
      return {
        isValid: false,
        errorMessage: "Please fix validation errors in Contact Information.",
        errorStep: 2
      };
    }
  }

  // Billing form validation (admin/super only)
  if (isAdminOrSuper.value && billingForm.value) {
    const result = await billingForm.value.validate();
    if (!result?.valid) {
      return {
        isValid: false,
        errorMessage: "Please fix validation errors in Billing Information.",
        errorStep: 4
      };
    }
  }

  return { isValid: true };
};

const validateRequiredFields = () => {
  // Validate organization type
  if (!formData.orgType) {
    orgTypeError.value = true;
    return {
      isValid: false,
      errorMessage: "Please select an organization type.",
      errorStep: 3
    };
  }

  // Validate phone
  if (!formData.phone) {
    return {
      isValid: false,
      errorMessage: "Phone number is required.",
      errorStep: 2
    };
  }

  return { isValid: true };
};

const getBasePayload = () => ({
  name: formData.name,
  email: formData.email,
  phone: formData.phone,
  address: formData.address || undefined,
  website: formData.website || undefined,
  orgType: formData.orgType,
  subscriptionTier: formData.subscriptionTier,
});

const updateOrganization = async (basePayload) => {
  if (isAdminOrSuper.value) {
    // Admin/Super update with full fields
    const payload = {
      id: orgStore.currentOrganization.id,
      ...basePayload,
      billingCycle: formData.billingCycle,
      billingEmail: formData.billingEmail || undefined,
      billingAddress: formData.billingAddress || undefined,
      taxId: formData.taxId || undefined,
      registrationNumber: formData.registrationNumber || undefined,
      autoRenew: formData.autoRenew,
      maxEvents: formData.maxEvents,
      maxParticipantsPerEvent: formData.maxParticipantsPerEvent,
      maxConcurrentEvents: formData.maxConcurrentEvents,
      maxStorageGB: formData.maxStorageGB,
      customDomain: formData.customDomain || undefined,
      ssoEnabled: formData.ssoEnabled,
      apiAccessEnabled: formData.apiAccessEnabled,
      webhookUrl: formData.webhookUrl || undefined,
      dedicatedSupport: formData.dedicatedSupport,
      customSLA: formData.customSLA,
    };
    await orgStore.updateOrganization(payload);
    success.value = "Organization updated successfully!";
    return payload;
  } else {
    // Regular user update with limited fields
    const payload = {
      id: orgStore.currentOrganization.id,
      ...basePayload,
    };
    await orgStore.updateOrganization(payload);
    success.value = "Organization updated successfully!";
    return payload;
  }
};

const createOrganization = async (basePayload) => {
  if (isAdminOrSuper.value) {
    // Admin/Super create (express create - auto-verified)
    const payload = {
      ...basePayload,
      billingEmail: formData.billingEmail || undefined,
      autoRenew: formData.autoRenew,
      maxEvents: formData.maxEvents || undefined,
      maxParticipants: formData.maxParticipantsPerEvent || undefined,
    };
    const result = await orgStore.expressCreateOrganization(payload);
    success.value = "Organization created and automatically verified!";
    return result;
  } else {
    // Regular user create (standard create - requires approval)
    const payload = {
      orgCreator: userStore.user.id,
      ...basePayload,
      billingCycle: formData.billingCycle,
      billingEmail: formData.billingEmail || undefined,
      billingAddress: formData.billingAddress || undefined,
      taxId: formData.taxId || undefined,
      registrationNumber: formData.registrationNumber || undefined,
      primaryContactName: userStore.user?.name || undefined,
      primaryContactPhone: formData.phone || undefined,
      autoRenew: formData.autoRenew,
      maxEvents: formData.maxEvents || undefined,
      maxParticipantsPerEvent: formData.maxParticipantsPerEvent || undefined,
    };
    const result = await orgStore.standardCreateOrganization(payload);
    success.value = "Organization created successfully! Awaiting legal verification.";
    return result;
  }
};

const handleSuccess = async (createdOrganization) => {
  // Clear current organization if editing
  if (isEdit.value) {
    orgStore.currentOrganization = null;
  }

  // Refresh data
  localStorage.removeItem("defaultDashboard");
  await userStore.refreshDashboard();

  if (orgStore.page && orgStore.limit) {
    await orgStore.fetchMyOrganizations(userStore?.user?.id || "")
    await orgStore.fetchOrganizationsPaginated(orgStore.page, orgStore.limit);
  }

  // Emit success
  emit("success", createdOrganization);
};

// Reset showUploader when dialog closes
 
 
watch(
  () => dialogStore.visible,
  (visible) => {
    if (!visible) {
      resetForm();
    }
  }
);

const closeDialog = () => {
  dialogStore.closeCreateOrganization(userStore.user?.id || "", {
    source: "events-management",
  });
};

// Clean up
onUnmounted(() => {
  if (isEdit.value) {
    orgStore.currentOrganization = null;
  }
});

// Validation rules
const nameRules = [
  (v) => !!v?.trim() || "Organization name is required",
  (v) =>
    !v ||
    v.length <= 100 ||
    "Organization name must be less than 100 characters",
];

const emailRules = [
  (v) => !!v?.trim() || "Email is required",
  (v) => /.+@.+\..+/.test(v) || "Please enter a valid email address",
  (v) => !v || v.length <= 255 || "Email must be less than 255 characters",
];

const billingEmailRules = [
  (v) => !v || /.+@.+\..+/.test(v) || "Please enter a valid email address",
  (v) => !v || v.length <= 255 || "Email must be less than 255 characters",
];

const phoneRules = [
  (v) => !!v?.trim() || "Phone number is required",
  (v) => {
    if (!v) return true;
    const cleaned = v.replace(/[\s\-\(\)\.]/g, "");
    if (!/^\+\d{6,16}$/.test(cleaned)) {
      return "Enter valid phone number with country code (e.g., +1234567890)";
    }
    const localNumber = cleaned.replace(/^\+\d{1,3}/, "");
    if (localNumber.length < 4) {
      return "Phone number too short";
    }
    if (/^(\+)\1+$/.test(cleaned)) {
      return "Please enter a valid phone number";
    }
    return true;
  },
];

const websiteRules = [
  (v) => !v || v.length <= 2000 || "URL must be less than 2000 characters",
  (v) => {
    if (!v) return true;
    try {
      const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
      return (
        (["http:", "https:"].includes(u.protocol) &&
          (u.hostname === "localhost" || /\.[a-z]{2,}$/i.test(u.hostname))) ||
        "Enter a valid URL (e.g., https://example.com)"
      );
    } catch {
      return "Enter a valid URL (e.g., https://example.com)";
    }
  },
];

// Options
const orgTypeOptions = orgTypes.industryVerticals;
const subscriptionTierOptions = [
  { title: "Free", value: "FREE" },
  { title: "Pro", value: "PRO" },
  { title: "Enterprise", value: "ENTERPRISE" },
];
const billingCycleOptions = [
  { title: "Monthly", value: "MONTHLY" },
  { title: "Quarterly", value: "QUARTERLY" },
  { title: "Annual", value: "ANNUAL" },
];
</script>

<style scoped>
.org-card {
  position: relative;
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.org-type-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.org-type-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}

.tooltip-content {
  max-width: 200px;
  padding: 4px;
}
</style>