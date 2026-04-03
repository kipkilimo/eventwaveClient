<template>
  <v-app v-if="!loading">
    <v-app-bar color="secondary" dark app>
      <v-app-bar-title class="d-flex align-center">
        <v-icon icon="mdi-bank" class="mr-2"></v-icon>
        EventWave Admin Dashboard
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn
        color="white"
        icon
        @click="refreshData"
        :loading="loading"
        :disabled="loading"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-6">
        <v-card>
          <v-card-title class="d-flex align-center flex-wrap">
            <div class="d-flex align-center mr-4 mb-2">
              <v-icon icon="mdi-briefcase-check-outline" class="mr-2"></v-icon>
              Organizations ({{ totalItems }})
            </div>

            <v-spacer></v-spacer>

            <!-- Pagination Controls -->
            <div class="d-flex align-center flex-wrap">
              <v-select
                v-model="itemsPerPage"
                :items="pageSizeOptions"
                label="Items per page"
                density="compact"
                hide-details
                class="mr-4 mb-2"
                style="max-width: 130px"
                :disabled="loading"
                @update:model-value="handlePageSizeChange"
              ></v-select>

              <v-pagination
                v-model="currentPage"
                :length="totalPages"
                :total-visible="7"
                density="comfortable"
                class="mr-4 mb-2"
                :disabled="loading"
                @update:model-value="handlePageChange"
              ></v-pagination>

              <v-text-field
                v-model="search"
                append-inner-icon="mdi-magnify"
                label="Search organizations..."
                single-line
                hide-details
                density="compact"
                class="mb-2"
                style="max-width: 300px"
                :disabled="loading"
                clearable
                @click:clear="search = ''"
              ></v-text-field>
            </div>
          </v-card-title>

          <v-card-text>
            <v-progress-linear
              v-if="loading"
              indeterminate
              color="secondary"
            ></v-progress-linear>

            <v-data-table
              v-else
              :headers="headers"
              :items="filteredOrganizations"
              :items-per-page="itemsPerPage"
              :page="currentPage"
              :server-items-length="totalItems"
              item-value="id"
              class="elevation-1"
              hide-default-footer
              :loading="loading"
            >
              <template v-slot:item.name="{ item }">
                <div class="d-flex align-center">

                  <v-avatar size="36" class="mr-3" :color="getOrgTypeColor(item.orgType)" variant="tonal">
                   <v-icon size="27">{{ getOrgIcon(item.orgType) }}</v-icon> 
                  </v-avatar> 

                  <div>
                    <div class="font-weight-medium text-no-wrap">
                      {{ item.name }}
                    </div>
                    <div class="text-caption text-disabled">
                      {{ item.email }}
                    </div>
                  </div>
                </div>
              </template>

              <template v-slot:item.orgType="{ item }">
                <v-chip
                  :color="getOrgTypeColor(item.orgType)"
                  size="small"
                  variant="flat"
                >
                  {{ item.orgType }}
                </v-chip>
              </template>

              <template v-slot:item.subscriptionTier="{ item }">
                <v-chip
                  :color="getOrgTypeColor(item.orgType)"
                  size="small"
                  variant="flat"
                >
                  {{ item.subscriptionTier }}
                </v-chip>
              </template>

              <template v-slot:item.isBlocked="{ item }">
                <v-tooltip :text="item.isBlocked ? 'Blocked' : 'Active'">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      :color="item.isBlocked ? 'error' : 'success'"
                      size="small"
                    >
                      {{ item.isBlocked ? "mdi-cancel" : "mdi-check-circle" }}
                    </v-icon>
                  </template>
                </v-tooltip>
              </template>

              <template v-slot:item.admins="{ item }">
                <div class="d-flex flex-column">
                  <template v-if="item.admins.length > 2">
                    <v-tooltip :text="getAdminNames(item.admins)">
                      <template v-slot:activator="{ props }">
                        <div v-bind="props" class="text-caption text-no-wrap">
                          {{ item.admins[0].name }} ({{
                            item.admins.length - 1
                          }}
                          others)
                        </div>
                      </template>
                    </v-tooltip>
                  </template>
                  <template v-else>
                    <div
                      v-for="admin in item.admins"
                      :key="admin.id"
                      class="text-caption text-no-wrap"
                    >
                      {{ admin.name }}
                    </div>
                  </template>
                </div>
              </template>

              <template v-slot:item.createdAt="{ item }">
                <span class="text-no-wrap">{{
                  formatDate(item.createdAt)
                }}</span>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-menu location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      v-bind="props"
                      variant="text"
                      size="small"
                      :disabled="loading"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="openOrganizationDetails(item)">
                      <template v-slot:prepend>
                        <v-icon icon="mdi-eye" size="small"></v-icon>
                      </template>
                      <v-list-item-title>View Details</v-list-item-title>
                    </v-list-item>

                    <v-list-item @click="openLegalDialog(item)">
                      <template v-slot:prepend>
                        <v-icon icon="mdi-file-document" size="small"></v-icon>
                      </template>
                      <v-list-item-title>Legal Documents</v-list-item-title>
                    </v-list-item>

                    <v-list-item @click="openInvoicesDialog(item)">
                      <template v-slot:prepend>
                        <v-icon icon="mdi-receipt" size="small"></v-icon>
                      </template>
                      <v-list-item-title>Invoices</v-list-item-title>
                    </v-list-item>

                    <v-list-item @click="openPaymentsDialog(item)">
                      <template v-slot:prepend>
                        <v-icon icon="mdi-credit-card" size="small"></v-icon>
                      </template>
                      <v-list-item-title>Payments</v-list-item-title>
                    </v-list-item>

                    <v-divider></v-divider>

                    <v-list-item @click="openEditDialog(item)">
                      <template v-slot:prepend>
                        <v-icon icon="mdi-pencil" size="small"></v-icon>
                      </template>
                      <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>

              <template v-slot:loading>
                <v-row justify="center" align="center" class="py-4">
                  <v-progress-circular
                    indeterminate
                    color="secondary"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-data-table>

            <!-- Footer with pagination info -->
            <div
              class="d-flex justify-space-between align-center flex-wrap mt-4 gap-2"
            >
              <span class="text-caption text-disabled">
                Showing {{ showingStart }} to {{ showingEnd }} of
                {{ totalItems }} organizations
              </span>
              <v-select
                v-model="itemsPerPage"
                :items="pageSizeOptions"
                label="Items per page"
                density="compact"
                hide-details
                style="max-width: 130px"
                :disabled="loading"
                @update:model-value="handlePageSizeChange"
              ></v-select>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
    <v-dialog v-model="orgStore.dialogs.details" width="800">
      <OrganizationDetailsDialog
        :organization="orgStore.selectedOrganization"
        @close="orgStore.dialogs.details = false"
      />
    </v-dialog>

    <v-dialog v-model="orgStore.dialogs.legal" width="47.6rem">
      <LegalDocumentsDialog
        :organization="orgStore.selectedOrganization"
        @close="orgStore.dialogs.legal = false"
      />
    </v-dialog>

    <v-dialog v-model="orgStore.dialogs.invoices" width="1200">
      <InvoicesDialog
        :organization="orgStore.selectedOrganization"
        @close="orgStore.dialogs.invoices = false"
      />
    </v-dialog>

    <v-dialog v-model="orgStore.dialogs.payments" width="1200">
      <PaymentsDialog
        :organization="orgStore.selectedOrganization"
        @close="orgStore.dialogs.payments = false"
      />
    </v-dialog>

    <v-dialog v-model="orgStore.dialogs.edit" width="600">
      <EditOrganizationDialog
        :organization="orgStore.selectedOrganization"
        @saved="handleOrganizationUpdated"
        @close="orgStore.dialogs.edit = false"
      />
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useOrganizationStore } from "@/stores/organization";

// Import dialog components
import OrganizationDetailsDialog from "@/components/dashboards/SuperTools/OrganizationDetailsDialog.vue";
import LegalDocumentsDialog from "@/components/dashboards/SuperTools/LegalDocumentsDialog.vue";
import InvoicesDialog from "@/components/dashboards/SuperTools/InvoicesDialog.vue";
import PaymentsDialog from "@/components/dashboards/SuperTools/PaymentsDialog.vue";
import EditOrganizationDialog from "@/components/dashboards/SuperTools/EditOrganizationDialog.vue";

const orgStore = useOrganizationStore();

// Reactive state
const currentPage = ref(1);
const itemsPerPage = ref(10);
const loading = ref(false);
const search = ref("");
const error = ref(null);

// Constants
const pageSizeOptions = [10, 20, 50, 100];

// Table headers
const headers = [
  {
    title: "Organization",
    key: "name",
    sortable: true,
    width: "25%",
  },
  {
    title: "Type",
    key: "orgType",
    sortable: true,
    width: "15%",
  },
  {
    title: "Tier",
    key: "subscriptionTier",
    sortable: true,
    width: "15%",
  },
  {
    title: "Status",
    key: "isBlocked",
    sortable: true,
    width: "10%",
  },
  {
    title: "Admins",
    key: "admins",
    sortable: false,
    width: "20%",
  },
  {
    title: "Created",
    key: "createdAt",
    sortable: true,
    width: "10%",
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
    align: "end",
    width: "5%",
  },
];

// Computed properties
const organizations = computed(() => orgStore.organizations || []);
const totalItems = computed(() => orgStore.total || 0);

const filteredOrganizations = computed(() => {
  if (!search.value.trim()) return organizations.value;

  const searchLower = search.value.toLowerCase().trim();
  return organizations.value.filter(
    (org) =>
      org.name?.toLowerCase().includes(searchLower) ||
      org.email?.toLowerCase().includes(searchLower) ||
      org.orgType?.toLowerCase().includes(searchLower)
  );
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value));
});

const showingStart = computed(() => {
  return Math.min(
    (currentPage.value - 1) * itemsPerPage.value + 1,
    totalItems.value
  );
});

const showingEnd = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return Math.min(end, totalItems.value);
});

// Utility functions
const getInitials = (name) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
};

// ICON MAPPING (Your original code is fine here)
const ORG_ICON_MAP = {
  HOTEL: "mdi-home-city",
  GOVERNMENT: "mdi-bank-outline",
  NGO: "mdi-book-heart-outline",
  CBO: "mdi-account-group-outline",
  PRIVATE: "mdi-door-closed-lock",
  BUSINESS: "mdi-domain",
};

function getOrgIcon(orgType) {
  // Fallback ensures a non-breaking icon if orgType is undefined or missing
  return ORG_ICON_MAP[orgType] || "mdi-office-building";
}

// COLOR MAPPING (Updated to use distinct, meaningful colors)
const getOrgTypeColor = (type) => {
  const colors = {
    // Distinct colors for visual differentiation
    HOTEL: "#FFB300", // Amber
    GOVERNMENT: "#0077C2", // Dark Blue (Official)
    NGO: "#4CAF50", // Green (Community/Health)
    CBO: "#673AB7", // Deep Purple (Group/Local)
    PRIVATE: "#009688", // Teal (Corporate)
    BUSINESS: "#E53935", // Red (General Business)
  };
  // Fallback color
  return colors[type] || "grey";
};

const getAdminNames = (admins) => {
  return admins.map((admin) => admin.name).join(", ");
};

const formatDate = (dateString) => {
  if (!dateString) return "Not set";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

// Data loading functions
const loadOrganizations = async (
  page = currentPage.value,
  limit = itemsPerPage.value
) => {
  if (loading.value) return;

  loading.value = true;
  error.value = null;

  try {
    await orgStore.fetchOrganizationsPaginated(page, limit);

    // Validate current page after loading
    if (currentPage.value > totalPages.value) {
      currentPage.value = Math.max(1, totalPages.value);
    }
  } catch (err) {
    console.error("❌ Failed to load organizations:", err);
    error.value = err.message || "Failed to load organizations";
    // You could show a notification here
  } finally {
    loading.value = false;
  }
};

// Event handlers
const handlePageChange = (newPage) => {
  if (newPage === currentPage.value) return;

  currentPage.value = newPage;
  loadOrganizations(newPage, itemsPerPage.value);
};

const handlePageSizeChange = (newSize) => {
  itemsPerPage.value = newSize;
  currentPage.value = 1;
  loadOrganizations(1, newSize);
};

const refreshData = () => {
  loadOrganizations(currentPage.value, itemsPerPage.value);
};

const handleOrganizationUpdated = () => {
  refreshData();
};

// Dialog functions
const openOrganizationDetails = (org) => {
  orgStore.openDialog(org, "details");
};

const openLegalDialog = (org) => {
  orgStore.openDialog(org, "legal");
};

const openInvoicesDialog = (org) => {
  // Ensure organization has invoices array
  if (!org.invoices || org.invoices.length === 0) {
    org.invoices = [
      {
        id: "INV-100",
        amount: 0.0,
        status: "DRAFT",
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      },
    ];
  }
  orgStore.openDialog(org, "invoices");
};

const openPaymentsDialog = (org) => {
  // Ensure organization has payments array
  if (!org.payments || org.payments.length === 0) {
    org.payments = [
      {
        id: "PAY-100",
        amount: 50.0,
        status: "PENDING",
        paymentMethod: "CARD",
        createdAt: new Date().toISOString(),
        reference: "REF000",
      },
    ];
  }
  orgStore.openDialog(org, "payments");
};

const openEditDialog = (org) => {
  orgStore.openDialog(org, "edit");
};

// Debounced search (optional - uncomment if you want search to trigger API calls)
// const debouncedSearch = useDebounceFn(() => {
//   currentPage.value = 1;
//   loadOrganizations();
// }, 500);

// Watch for search changes (if you want client-side filtering, remove this)
// watch(search, debouncedSearch);

// Lifecycle
onMounted(() => {
  loadOrganizations();
});
</script>

<style scoped>
.text-no-wrap {
  white-space: nowrap;
}

.gap-2 {
  gap: 8px;
}

/* Responsive adjustments */
@media (max-width: 1264px) {
  .v-card-title {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .v-card-title .v-spacer {
    display: none;
  }

  .d-flex.flex-wrap {
    justify-content: space-between;
    width: 100%;
  }
}
</style>
