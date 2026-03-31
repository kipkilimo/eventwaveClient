<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useOrganizationStore } from "@/stores/organization";
import { router } from "@/router";
import { useUserStore } from "@/stores/user";

const apiUrl = import.meta.env.VITE_API_URL;
const orgStore = useOrganizationStore();
const userStore = useUserStore();
// Email form state
const emails = ref<string[]>([""]);
const emailInput = ref("");
const isLoading = ref(false);
const voucherResult = ref<{
  success: boolean;
  message: string;
  data?: any;
} | null>(null);

// Helper function to dynamically determine chip color
const getColor = (status: any) => {
  switch (status) {
    case false:
      return "success";
    case true:
      return "error";
    case "":
      return "grey";
    default:
      return "grey";
  }
};
 
// Helper function to dynamically determine chip icon
const getIcon = (status: any) => {
  switch (status) {
    case false:
      return "mdi-lock-open-check-outline";
    case true:
      return "mdi-block-helper";
    case "":
      return "folder-question-outline";
    default:
      return "folder-question-outline";
  }
};

// Email validation
const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if there are any valid emails
const hasValidEmails = computed(() => {
  return emails.value.some(
    (email) => email.trim() && isEmailValid(email.trim())
  );
});

// Process comma-separated emails
const processEmailInput = () => {
  if (!emailInput.value.trim()) return;

  const rawEmails = emailInput.value
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

  const validEmails: string[] = [];
  const invalidEmails: string[] = [];

  rawEmails.forEach((email) => {
    if (isEmailValid(email)) {
      validEmails.push(email);
    } else {
      invalidEmails.push(email);
    }
  });

  // Add valid emails to the main emails array
  validEmails.forEach((email) => {
    if (!emails.value.includes(email) && emails.value.length < 5) {
      emails.value.push(email);
    }
  });

  // Show warning for invalid emails
  if (invalidEmails.length > 0) {
    voucherResult.value = {
      success: false,
      message: `Invalid email format: ${invalidEmails.join(", ")}`,
    };
  }

  // Clear input field
  emailInput.value = "";
};

// Email management methods
const addEmailField = () => {
  if (emails.value.length < 5) {
    emails.value.push("");
  }
};

const removeEmail = (index: number) => {
  if (emails.value.length > 1) {
    emails.value.splice(index, 1);
  }
};

// Clear all emails
const clearAllEmails = () => {
  emails.value = [""];
  emailInput.value = "";
  voucherResult.value = null;
};

// Watch for email changes to clear results
watch(
  emails,
  () => {
    voucherResult.value = null;
  },
  { deep: true }
);

// Generate voucher function
const generateVoucher = async () => {
  if (!orgStore.currentOrganization) {
    voucherResult.value = {
      success: false,
      message: "Please select an organization first",
    };
    return;
  }
  // nkilimo@students.uonbi.ac.ke,kipkilimo@gmail.com,cafenetpoint2016@gmail.com
  const validEmails = emails.value
    .map((email) => email.trim())
    .filter((email) => email && isEmailValid(email));

  if (validEmails.length === 0) {
    voucherResult.value = {
      success: false,
      message: "Please enter at least one valid email address",
    };
    return;
  }

  isLoading.value = true;
  voucherResult.value = null;

  try {
    const payload = {
      adminId: userStore?.user?.id || "",
      orgId: orgStore.currentOrganization.id,
      emails: validEmails,
    };

    const response = await fetch(
      apiUrl + "/api/organization/generate-voucher",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    voucherResult.value = {
      success: true,
      message: `Voucher generated successfully for ${validEmails.length} email(s)`,
      data: result,
    };

    // Clear form on success
    emails.value = [""];
    emailInput.value = "";
    setTimeout(() => {
      orgStore.newVoucherDialog = false;
    }, 2000);
  } catch (error) {
    console.error("Error generating voucher:", error);
    voucherResult.value = {
      success: false,
      message: "Failed to generate voucher. Please try again.",
    };
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <v-card class="mx-auto" elevation="5" max-width="1200">
    <v-row no-gutters>
      <v-col cols="12" md="4" class="pa-4 border-e">
        <!-- Selected Organization Display -->
        <v-card
          variant="outlined"
          v-if="orgStore.currentOrganization"
          class="rounded-lg bg-blue-grey-lighten-5 h-100"
        >
          <v-card-item>
            <template #prepend>
              <v-icon
                icon="mdi-office-building"
                color="primary"
                size="24"
              ></v-icon>
            </template>
            <v-card-title class="text-h6 font-weight-bold text-blue-800">
              {{ orgStore.currentOrganization.name }}
            </v-card-title>
          </v-card-item>

          <v-card-text class="pt-4">
            <v-list density="comfortable" class="bg-transparent">
              <v-list-item class="d-block">
                <template #prepend>
                  <v-icon icon="mdi-shield-account" class="mr-2"></v-icon>
                </template>
                <v-list-item-title class="font-weight-medium w-100"
                  >Status:</v-list-item-title
                >
                <v-list-item-subtitle>
                  <v-chip
                    :color="getColor(orgStore.currentOrganization.isBlocked)"
                    size="small"
                    class="ml-1"
                  >
                    <v-icon
                      :icon="getIcon(orgStore.currentOrganization.isBlocked)"
                      start
                      size="16"
                    ></v-icon>
                    {{
                      orgStore.currentOrganization.isBlocked
                        ? "Blocked"
                        : "Active"
                    }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8" class="pa-4">
        <!-- Email Form for Voucher Generation -->
        <v-card class="rounded-lg bg-blue-lighten-5 h-100">
          <v-card-item>
            <template #prepend>
              <v-icon icon="mdi-email-send" color="primary" size="24"></v-icon>
            </template>
            <v-card-title class="text-h6 font-weight-bold text-blue-800">
              Generate Voucher
            </v-card-title>
            <template #append>
              <v-btn
                v-if="emails.length > 1 || emails[0]"
                variant="text"
                size="small"
                @click="clearAllEmails"
                color="error"
                icon="mdi-delete-sweep"
              >
                Clear All
              </v-btn>
            </template>
          </v-card-item>

          <v-card-text>
            <!-- Email Input with Comma Support -->
            <v-text-field
              v-model="emailInput"
              label="Enter email addresses (comma separated)"
              type="text"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              @keydown.enter="processEmailInput"
              @blur="processEmailInput"
              :hint="`${emails.filter((e) => e).length}/5 emails added`"
              persistent-hint
            >
              <template #append>
                <v-btn
                  icon="mdi-plus"
                  variant="tonal"
                  size="small"
                  @click="processEmailInput"
                  color="primary"
                  :disabled="!emailInput.trim()"
                ></v-btn>
              </template>
            </v-text-field>

            <!-- Email Chips Display -->
            <v-card
              v-if="emails.some((email) => email)"
              variant="flat"
              class="mb-2"
            >
              <v-card-text>
                <div class="text-caption text-medium-emphasis mb-2">
                  Selected Emails:
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="(email, index) in emails.filter((e) => e)"
                    :key="index"
                    :color="isEmailValid(email) ? 'primary' : 'error'"
                    variant="flat"
                    size="small"
                    closable
                    @click:close="removeEmail(index)"
                    class="ma-1"
                  >
                    <v-icon
                      :icon="
                        isEmailValid(email)
                          ? 'mdi-email-check'
                          : 'mdi-email-alert'
                      "
                      start
                      size="16"
                    ></v-icon>
                    {{ email }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>

            <!-- Individual Email Fields     <div class="text-caption text-medium-emphasis mb-2">Or add emails individually:</div>
            <div v-for="(email, index) in emails" :key="`field-${index}`" class="mb-2">
              <v-text-field
                v-model="emails[index]"
                label="Email Address"
                type="email"
                variant="outlined"
                density="comfortable"
                :rules="[
                  (v) =>
                    !v ||
                    isEmailValid(v) ||
                    'Please enter a valid email address',
                ]"
              >
                <template v-if="emails.length > 1" #append>
                  <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    @click="removeEmail(index)"
                    color="error"
                  ></v-btn>
                </template>
              </v-text-field>
            </div><v-btn
                  v-if="emails.length < 10"
                  icon="mdi-plus"
                  variant="outlined"
                  size="small"
                  @click="addEmailField"
                  color="primary"
                >
                  Add Field
                </v-btn>-->
<v-divider/>
            <div
              class="d-flex justify-space-between align-center mt-4 flex-wrap gap-2"
            ></div>
            <v-card-actions>
              <v-btn
                type="submit"
                block
                color="#ffffff"
                :loading="isLoading"
                :disabled="!hasValidEmails || !orgStore.currentOrganization"
                size="large"
                class="flex-grow-0"
                style="
                  background: linear-gradient(135deg, #1867c0 0%, #764ba2 100%);
                  border: none;
                  border-radius: 8px;
                  box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.1);
                  color: white;
                  font-weight: 600;
                  letter-spacing: 0.5px;
                  text-transform: uppercase;
                  transition: all 0.3s ease;
                  padding: 0 24px;
                  min-height: 48px;
                  position: relative;
                  overflow: hidden;
                "
                @mouseenter="
                  this.style.boxShadow = '0 6px 20px 0 rgba(102, 126, 234, 0.4)'
                "
                @mouseleave="
                  this.style.boxShadow = '0 4px 15px 0 rgba(0, 0, 0, 0.1)'
                "
                @click="generateVoucher"
              >
                <v-icon
                  icon="mdi-ticket-confirmation-outline"
                  class="mr-2"
                  style="font-size: 20px"
                ></v-icon>
                Generate Voucher
                <template #loader>
                  <v-progress-circular
                    indeterminate
                    size="20"
                    width="2"
                    style="color: white"
                  ></v-progress-circular>
                </template>
              </v-btn>
            </v-card-actions>
          </v-card-text>

          <!-- Voucher Result Message -->
          <v-card-text>
            <v-alert
              v-if="voucherResult"
              :type="voucherResult.success ? 'success' : 'error'"
              variant="tonal"
              class="mb-0"
              :icon="
                voucherResult.success
                  ? 'mdi-check-circle-outline'
                  : 'mdi-alert-circle-outline'
              "
            >
              <div class="d-flex align-center">
                <span>{{ voucherResult.message }}</span>
                <v-spacer v-if="voucherResult.success"></v-spacer>
                <v-progress-circular
                  v-if="voucherResult.success"
                  indeterminate
                  size="20"
                  width="2"
                  class="ml-2"
                ></v-progress-circular>
              </div>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<style scoped>
.border-e {
  border-inline-end: 1px solid
    rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .border-e {
    border-inline-end: none;
    border-bottom: 1px solid
      rgba(var(--v-border-color), var(--v-border-opacity));
  }
}

.gap-2 {
  gap: 8px;
}

/* Ensure proper spacing on mobile */
.v-card-text {
  padding: 16px;
}

/* Chip container responsive behavior */
.d-flex.flex-wrap {
  min-height: 40px;
}
</style>
