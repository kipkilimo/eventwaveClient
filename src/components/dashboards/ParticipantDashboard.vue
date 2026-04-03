<template>
  <v-app v-if="!loadingInitial">
    <!-- App Bar -->
    <v-app-bar color="primary" dark app>
      <v-app-bar-title class="d-flex align-center">
        <v-icon icon="mdi-calendar-multiple" class="mr-2"></v-icon>
        EventWave Event Management
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn
        color="white"
        icon
        @click="refreshAll"
        :loading="loading"
        :disabled="loading"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-6">
        <!-- Organizations Section -->
        <v-card class="mb-6">
          <v-card-title class="d-flex align-center flex-wrap">
            <v-chip color="primary" size="small"
                @click="toggleViewOrgs" class="d-flex align-center mr-4 mb-2">
              <v-icon icon="mdi-bank" class="mr-2"></v-icon>
              My Organizations ({{ orgStore.organizations.length }})
            </v-chip>

            <v-spacer></v-spacer>

            <div class="d-flex align-center flex-wrap">
              <v-btn
                variant="tonal"
                color="#850a85"
                prepend-icon="mdi-bank-plus"
                class="mb-2"
                @click="openCreateOrganization"
              >
                Add Organization
              </v-btn>

              <v-btn
                variant="text"
                prepend-icon="mdi-chevron-double-right"
                class="ml-2 mb-2"
                @click="toggleViewOrgs"
              >
                {{ showOrgs ? "Hide" : "View All" }}
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text v-if="showOrgs">
            <v-progress-linear
              v-if="loadingCurrent"
              indeterminate
              color="secondary"
            ></v-progress-linear>

            <v-row dense v-else>
              <v-col
                v-for="org in orgStore.organizations.slice(0, 6)"
                :key="org.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card
                  elevation="2"
                  class="organization-card"
                  :class="{ 'selected-org': isSelected(org) }"
                  @click="activateOrg(org)"
                  hover
                >
                  <v-card-text class="pa-3">
                    <div class="d-flex align-start justify-space-between">
                      <div class="d-flex align-center">
                        <v-avatar size="40" :color="getOrgTypeColor(org.orgType)" variant="tonal" class="mr-3">
                          <v-icon>{{ getOrgIcon(org.orgType) }}</v-icon>
                        </v-avatar>
                        <div>
                          <div class="font-weight-medium">{{ org.name }}</div>
                          <div class="text-caption text-grey">
                            {{ org.orgType || "N/A" }}
                          </div>
                        </div>
                      </div>
                      <v-chip size="small" color="indigo-lighten-4" variant="outlined">
                        {{ org.subscriptionTier || "FREE" }}
                      </v-chip>
                    </div>

                    <div class="mt-3 text-caption text-grey">
                      <div>Events: {{ org.events?.length || 0 }}</div>
                      <div>Users: {{ org.users?.length || 0 }}</div>
                      <div>Created: {{ formatDate(org.createdAt) }}</div>
                    </div>
                  </v-card-text>

                  <v-divider />

                  <v-card-actions class="pa-2">
                    <v-btn
                      size="small"
                      color="secondary"
                      variant="outlined"
                      prepend-icon="mdi-paperclip-check"
                      @click.stop="uploadMedia(org)"
                    >
                      Legal
                    </v-btn>
                    <v-btn
                      size="small"
                      color="primary"
                      variant="outlined"
                      prepend-icon="mdi-wrench-cog-outline"
                      @click.stop="manageOrg(org)"
                    >
                      Manage
                    </v-btn>
                    <v-btn
                      size="small"
                      color="success"
                      variant="outlined"
                      prepend-icon="mdi-ticket-percent-outline"
                      @click.stop="getVoucher(org)"
                    >
                      Voucher
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Events Section -->
        <v-card>
          <v-card-title class="d-flex align-center flex-wrap">
            <div class="d-flex align-center mr-4 mb-2">
              <v-icon icon="mdi-calendar-multiple" class="mr-2"></v-icon>
              <span>
                Events 
                <span v-if="orgStore.currentOrganization" class="text-caption font-weight-bold">
                  ({{ orgStore.currentOrganization.name }})
                </span>
                <span v-else class="text-caption">
                  (All Organizations)
                </span>
                : {{ filteredEvents.length }}
              </span>
            </div>

            <!-- Clear Organization Selection Button -->
            <v-btn
              v-if="orgStore.currentOrganization"
              variant="text"
              size="small"
              color="primary"
              prepend-icon="mdi-close-circle"
              class="mb-2 mr-2"
              @click="clearOrgSelection"
            >
              Clear Filter
            </v-btn>

            <v-spacer></v-spacer>

            <div class="d-flex align-center flex-wrap gap-2">
              <!-- Search -->
              <v-text-field
                v-model="search"
                append-inner-icon="mdi-magnify"
                label="Search events..."
                single-line
                hide-details
                density="compact"
                class="mb-2"
                style="max-width: 250px"
                clearable
              ></v-text-field>

              <!-- Status Filter -->
              <v-select
                v-model="filters.status"
                :items="statusOptions"
                label="Status"
                density="compact"
                hide-details
                clearable
                class="mb-2"
                style="max-width: 130px"
              ></v-select>

              <!-- Sort By -->
              <v-select
                v-model="filters.sortBy"
                :items="sortOptions"
                label="Sort By"
                density="compact"
                hide-details
                class="mb-2"
                style="max-width: 130px"
              ></v-select>

              <!-- Export Button -->
              <v-btn
                variant="outlined"
                prepend-icon="mdi-download"
                size="small"
                class="mb-2"
                @click="exportEvents"
              >
                Export
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text>
            <v-progress-linear
              v-if="loading"
              indeterminate
              color="secondary"
            ></v-progress-linear>

            <!-- Events Table -->
            <v-data-table
              v-else
              :headers="headers"
              :items="filteredEvents"
              :items-per-page="pagination.itemsPerPage"
              :page="pagination.page"
              :search="search"
              :loading="loading"
              item-value="id"
              class="elevation-1"
              hide-default-footer
              :item-class="getRowClass"
            >
              <template v-slot:item.title="{ item }">
                <div class="d-flex align-center">
                  <v-icon
                    :icon="getStatusIcon(item.status)"
                    :color="getStatusColor(item.status)"
                    size="small"
                    class="mr-2"
                  ></v-icon>
                  <div>
                    <div class="font-weight-medium">{{ item.title }}</div>
                    <div class="text-caption text-grey">
                      Key: {{ item.eventSecret }}
                    </div>
                  </div>
                </div>
              </template>

         <template v-slot:item.organizer="{ item }">
  <v-chip size="small" variant="outlined" color="primary">
    {{ item.organizer?.name || "None" }}
  </v-chip>
</template>


              <template v-slot:item.organization="{ item }">
                <span>{{ item.organization?.name || "None" }}</span>
              </template>
              <template v-slot:item.facilitators="{ item }">
                <div v-if="item.facilitators?.length">
                  <v-chip
                    v-for="facilitator in item.facilitators.slice(0, 2)"
                    :key="facilitator.id"
                    size="x-small"
                    variant="outlined"
                    class="mr-1 mb-1"
                  >
                    {{ facilitator.name }}
                  </v-chip>
                  <v-chip
                    v-if="item.facilitators.length > 2"
                    size="x-small"
                    variant="tonal"
                    color="grey"
                  >
                    +{{ item.facilitators.length - 2 }}
                  </v-chip>
                </div>
                <span v-else class="text-caption text-grey">None</span>
              </template>

  <template v-slot:item.status="{ item }">
  <v-tooltip v-if="!isActiveEvent(item)" location="top">
    <template v-slot:activator="{ props }">
      <v-chip
        v-bind="props"
        :color="getChipStatusColor(false)"
        size="small"
        variant="outlined" 
        class="opacity-60"
        @click="setActiveEvent(item)"
      >
        {{ item.status.toLowerCase() }}
      </v-chip>
    </template>

    <span>Load to viewer (activate)</span>
  </v-tooltip>

  <!-- Active state -->
  <v-chip
    v-else
    :color="getChipStatusColor(true)"
    size="small"
    variant="flat"
    class="text-capitalize active-event-chip"
    @click="setActiveEvent(item)"
  >
    {{ item.status.toLowerCase() }}
    <span class="ml-1">(Active)</span>
  </v-chip>
</template>

              <template v-slot:item.timing="{ item }">
                <div class="text-caption">
                  <div>
                    {{ formatDateTime(item.dateTime?.start) }}
                  </div>

                  <v-chip
                    :color="getEventTimingStatus(item).color"
                    size="x-small"
                    variant="flat"
                    class="mt-1"
                  >
                    <v-icon size="14" class="mr-1 mb-1">
                      mdi-clock-outline
                    </v-icon>

                    Duration: {{ getEventDuration(item) }}

                    <span class="mx-1">|</span>

                    <v-icon
                      size="14"
                      class="mr-1 mb-1"
                    >
                      {{ getStatusIcon(getEventTimingStatus(item).text) }}
                    </v-icon>

                    Starts in {{ getEventTimingStatus(item).text }}
                  </v-chip>
                </div>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-menu location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props" variant="text" size="small">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item 
                      v-for="menuItem in menuItems" 
                      :key="menuItem.action"
                      @click="menuItem.handler(item)"
                      :class="{ 'text-error': menuItem.isDestructive }"
                    >
                      <template v-slot:prepend>
                        <v-icon 
                          :icon="menuItem.icon" 
                          size="small"
                          :color="menuItem.isDestructive ? 'error' : undefined"
                        ></v-icon>
                      </template>
                      <v-list-item-title :class="{ 'text-error': menuItem.isDestructive }">
                        {{ menuItem.label }}
                      </v-list-item-title>
                      <v-divider v-if="menuItem.showDividerBefore" :key="`divider-${menuItem.action}`" />
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>

              <template v-slot:loading>
                <v-row justify="center" align="center" class="py-4">
                  <v-progress-circular indeterminate color="secondary"></v-progress-circular>
                </v-row>
              </template>

              <template v-slot:no-data>
                <v-alert type="info" variant="tonal" class="ma-4">
                  <span v-if="orgStore.currentOrganization">
                    No events found for {{ orgStore.currentOrganization.name }}.
                  </span>
                  <span v-else>
                    No events found.
                  </span>
                  <v-btn
                    size="small"
                    color="primary"
                    variant="text"
                    @click="openCreateEvent"
                    class="ml-2"
                  >
                    Create Event
                  </v-btn>
                </v-alert>
              </template>
            </v-data-table>

            <!-- Pagination Footer -->
            <div v-if="filteredEvents.length > 0" 
                 class="d-flex justify-space-between align-center flex-wrap mt-4 gap-2">
              <span class="text-caption text-grey">
                Showing {{ showingStart }} to {{ showingEnd }} of {{ filteredEvents.length }} events
              </span>
              <v-pagination
                v-model="pagination.page"
                :length="totalPages"
                :total-visible="5"
                density="comfortable"
                :disabled="loading"
              ></v-pagination>
              <v-select
                v-model="pagination.itemsPerPage"
                :items="pageSizeOptions"
                label="Per page"
                density="compact"
                hide-details
                style="max-width: 100px"
              ></v-select>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <!-- Dialogs -->
    <v-dialog v-model="showCreateOrganization" max-width="630" persistent>
      <CreateOrganization />
    </v-dialog>

    <v-dialog v-model="showLegalDocs" max-width="630" persistent>
      <LegalDocs />
    </v-dialog>

    <v-dialog v-model="showOrgDetails" max-width="800">
      <OrgDetails />
    </v-dialog>

    <v-dialog v-model="showVoucherDialog" width="66rem">
      <ProGenerateVoucher />
    </v-dialog>

    <v-dialog v-model="showEventForm" max-width="800" persistent>
      <EventFormDialog @saved="handleFormSaved" @cancel="handleDialogClose(DIALOG_NAMES.EVENT_FORM)" />
    </v-dialog>

    <v-dialog v-model="showEventView" max-width="75%" persistent>
      <v-card>
        <v-card-actions class="pa-2">
          <v-spacer></v-spacer>
          <v-btn
            icon
            small
            outlined
            @click="handleDialogClose(DIALOG_NAMES.EVENT_VIEW)"
          >
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
        <EventViewDialog @close="handleDialogClose(DIALOG_NAMES.EVENT_VIEW)" />
      </v-card>
    </v-dialog>

    <v-dialog v-model="showEventDelete" max-width="500" persistent>
      <EventDeleteDialog @confirmed="handleDeleteConfirmed" @cancel="handleDialogClose(DIALOG_NAMES.EVENT_DELETE)" />
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from "vue";

import { useUserStore } from "@/stores/user";
import { useEventStore } from "@/stores/event";
import { DIALOG_NAMES, useDialogStore } from "@/stores/dialog";
import { useOrganizationStore } from "@/stores/organization";
import { usePlayerStore } from "@/stores/player";
import { useLiveFeedStore } from "@/stores/livefeed";
import { useQnAStore } from "@/stores/qna";
import { useFeedbackStore } from "@/stores/feedback";

// Dialog components
import EventFormDialog from "@/components/dialogs/forms/CreateBusinessEvent.vue";
import EventViewDialog from "@/views/event/EventViewer.vue";
import EventDeleteDialog from "@/components/dialogs/event/ManageEvent.vue";
import CreateOrganization from "@/components/dialogs/forms/CreateOrganization.vue";
import LegalDocs from "@/components/dialogs/uploads/pdf/LegalDocs.vue";
import OrgDetails from "@/components/dialogs/details/OrgDetails.vue";
import ProGenerateVoucher from "@/components/dialogs/payments/EventVoucherRedeem.vue";

// Stores
const userStore = useUserStore();
const eventStore = useEventStore();
const dialogStore = useDialogStore();
const orgStore = useOrganizationStore();
const playerStore = usePlayerStore();
const livefeedStore = useLiveFeedStore();
const qnaStore = useQnAStore();
const feedbackStore = useFeedbackStore();

// UI State
const loading = ref(false);
const loadingInitial = ref(false);
const loadingCurrent = ref(false);
const search = ref("");
const showOrgs = ref(false);

// Pagination
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
});

const pageSizeOptions = [10, 25, 50];

// Filters
const filters = reactive({
  status: null as string | null,
  sortBy: "createdAt" as string,
});

const statusOptions = [
  { title: "Active", value: "ACTIVE" },
  { title: "Draft", value: "DRAFT" },
  { title: "Completed", value: "COMPLETED" },
  { title: "Cancelled", value: "CANCELLED" },
];

const sortOptions = [
  { title: "Title", value: "title" },
  { title: "Created Date", value: "createdAt" },
  { title: "Start Date", value: "startDate" },
];

// Active event tracking
const activeEventId = ref<string | null>(null);

// Table Headers - Added organization column
const headers = [
  { title: "Event", key: "title", sortable: true, width: "20%" },
  { title: "Organization", key: "organization", sortable: true, width: "15%" },
  { title: "Organizer", key: "organizer", sortable: true, width: "12%" },
  { title: "Facilitators", key: "facilitators", sortable: false, width: "18%" },
  { title: "Status", key: "status", sortable: true, width: "10%" },
  {
    title: "Timing",
    key: "timing",
    sortable: true,
    width: "20%",
    sort: (a: { dateTime: { start: string | number | Date; }; }, b: { dateTime: { start: string | number | Date; }; }) => {
      const dateA = a.dateTime?.start ? new Date(a.dateTime.start).getTime() : 0;
      const dateB = b.dateTime?.start ? new Date(b.dateTime.start).getTime() : 0;
      return dateA - dateB;
    }
  },  
  { title: "Actions", key: "actions", sortable: false, align: "end", width: "5%" },
];

// Dialog computed properties
const showEventForm = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.EVENT_FORM),
  set: (val) => { if (!val) handleDialogClose(DIALOG_NAMES.EVENT_FORM); },
});

const showEventView = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.EVENT_VIEW),
  set: (val) => { if (!val) handleDialogClose(DIALOG_NAMES.EVENT_VIEW); },
});

const showEventDelete = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.EVENT_DELETE),
  set: (val) => { if (!val) handleDialogClose(DIALOG_NAMES.EVENT_DELETE); },
});

const showCreateOrganization = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.CREATE_ORGANIZATION),
  set: (val) => { if (!val) dialogStore.closeCreateOrganization(); },
});

const showVoucherDialog = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.VOUCHER),
  set: (val) => { if (!val) dialogStore.closeVoucher(); },
});

const showLegalDocs = computed({
  get: () => orgStore.createOrgUpload || orgStore.showLegalUpload,
  set: (val) => {
    if (!val) {
      orgStore.createOrgUpload = false;
      orgStore.showLegalUpload = false;
    }
  },
});

const showOrgDetails = computed({
  get: () => orgStore.dialogDetailOpen,
  set: (val) => { if (!val) orgStore.dialogDetailOpen = false; },
});

// Computed - Show all events or org-specific events based on selection
const activeEvents = computed(() => {
  // If an organization is selected, show org-specific events
  if (orgStore.currentOrganization) {
    return eventStore.orgEvents || [];
  }
  // Otherwise show all events
  return eventStore.events || [];
});

const filteredEvents = computed(() => {
  let events = [...activeEvents.value];

  // Apply status filter
  if (filters.status) {
    events = events.filter(e => e.status === filters.status);
  }

  // Apply sorting
  if (filters.sortBy === "title") {
    events.sort((a, b) => a.title.localeCompare(b.title));
  } else if (filters.sortBy === "startDate") {
    events.sort((a, b) => new Date(a.dateTime?.start || 0).getTime() - new Date(b.dateTime?.start || 0).getTime());
  } else {
    events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return events;
});

const totalPages = computed(() => Math.ceil(filteredEvents.value.length / pagination.itemsPerPage));

const showingStart = computed(() => {
  if (filteredEvents.value.length === 0) return 0;
  return Math.min((pagination.page - 1) * pagination.itemsPerPage + 1, filteredEvents.value.length);
});

const showingEnd = computed(() => Math.min(pagination.page * pagination.itemsPerPage, filteredEvents.value.length));

// Reset pagination when organization changes or filters change
watch([() => orgStore.currentOrganization, () => filters.status, () => filters.sortBy], () => {
  pagination.page = 1;
});

// Helper Functions
const isActiveEvent = (event: any) => activeEventId.value === (event.id || event._id);

const getRowClass = (item: any) => isActiveEvent(item) ? "active-row" : "";

const isSelected = (org: any) => org?.id === orgStore.currentOrganization?.id;

const clearOrgSelection = () => {
  orgStore.currentOrganization = null;
  eventStore.orgEvents = [];
  activeEventId.value = null;
  eventStore.currentEvent = null;
};

// Organization Icon/Color Helpers
const ORG_ICON_MAP: Record<string, string> = {
  HOTEL: "mdi-home-city",
  GOVERNMENT: "mdi-bank-outline",
  NGO: "mdi-book-heart-outline",
  CBO: "mdi-account-group-outline",
  PRIVATE: "mdi-door-closed-lock",
  BUSINESS: "mdi-domain",
};

const getOrgIcon = (orgType: string) => ORG_ICON_MAP[orgType || ""] || "mdi-office-building";

const getOrgTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    HOTEL: "#FFB300",
    GOVERNMENT: "#0077C2",
    NGO: "#4CAF50",
    CBO: "#673AB7",
    PRIVATE: "#009688",
    BUSINESS: "#E53935",
  };
  return colors[type] || "grey";
};

// Event Status Helpers
const getStatusColor = (status: string) => {
  const colors = { ACTIVE: "green", DRAFT: "grey", COMPLETED: "blue", CANCELLED: "red" };
  return colors[status as keyof typeof colors] || "grey";
};

const getStatusIcon = (status: string) => {
  const icons = { ACTIVE: "mdi-check-circle", DRAFT: "mdi-pencil", COMPLETED: "mdi-flag-checkered", CANCELLED: "mdi-cancel" };
  return icons[status as keyof typeof icons] || "mdi-calendar";
};

const getChipStatusColor = (active: boolean) => active ? "success" : "grey-lighten-4";

// Date Helpers
const formatDate = (dateString: string | Date) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

// Helper function to calculate human-readable duration
const getDurationUntilEvent = (startDate: Date, now: Date): string => {
  const diffMs = startDate.getTime() - now.getTime();

  if (diffMs <= 0) return "Starting soon";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const remainingHours = totalHours % 24;
  const remainingMinutes = totalMinutes % 60;

  const parts: string[] = [];

  if (totalDays > 0) {
    parts.push(`${totalDays} day${totalDays !== 1 ? "s" : ""}`);
  }

  if (totalDays < 2 && remainingHours > 0) {
    parts.push(`${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`);
  }

  if (totalDays === 0 && remainingHours === 0 && remainingMinutes > 0) {
    parts.push(`${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`);
  }

  if (parts.length === 0) {
    return "Less than a minute";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  const lastPart = parts.pop();
  return `${parts.join(", ")} and ${lastPart}`;
};

const getEventDuration = (event: any): string => {
  if (!event?.dateTime?.start || !event?.dateTime?.end) return "N/A";

  const start = new Date(event.dateTime.start);
  const end = new Date(event.dateTime.end);

  const diffMs = end.getTime() - start.getTime();
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;

  return `${hours} hr ${minutes} min`;
};

const getEventTimingStatus = (event: any): { text: string; color: string } => {
  if (!event?.dateTime?.start || !event?.dateTime?.end) {
    return { text: "No date", color: "grey" };
  }

  const now = new Date();
  const start = new Date(event.dateTime.start);
  const end = new Date(event.dateTime.end);

  if (now > end) return { text: "Ended", color: "red" };
  if (now >= start && now <= end) return { text: "Ongoing", color: "green" };

  if (now < start) {
    const duration = getDurationUntilEvent(start, now);
    return { text: duration, color: "blue" };
  }

  return { text: "Unknown", color: "grey" };
};

// Actions
const refreshAll = async () => {
  loading.value = true;
  try {
    await resetAllStores();
    await userStore.refreshDashboard();
    await loadEvents();
  } finally {
    loading.value = false;
  }
};

const resetAllStores = async () => {
  if (livefeedStore.$reset) livefeedStore.$reset();
  if (qnaStore.$reset) qnaStore.$reset();
  if (feedbackStore.$reset) feedbackStore.$reset();
  if (playerStore.$reset) playerStore.$reset();
};

const loadEvents = async () => {
  const userId = userStore.user?.id;
  if (!userId) return;
  loading.value = true;
  try {
    await orgStore.fetchMyOrganizations(userId);
    await eventStore.fetchUserFacilitatingEvents(userId);
  } finally {
    loading.value = false;
  }
};

const activateOrg = async (org: any) => {
  if (!org) return;

  // If clicking the already selected organization, clear the selection
  if (orgStore.currentOrganization?.id === org.id) {
    clearOrgSelection();
    return;
  }

  loadingCurrent.value = true;

  await resetAllStores();

  orgStore.currentOrganization = org;

  // Filter events for the selected organization
  const allEvents = eventStore.events || [];

  eventStore.orgEvents = allEvents.filter((event: any) => {
    const orgId = event.organization?.id || event.organization || event.organizer?.id;
    return String(orgId) === String(org.id);
  });

  loadingCurrent.value = false;
};

const setActiveEvent = async (event: any) => {
  loadingCurrent.value = true;
  if (event?.eventSecret) {
    await resetAllStores();
    await eventStore.fetchEventBySecret(event.eventSecret);
    activeEventId.value = event.id || event._id;
    eventStore.currentEvent = eventStore.currentEvent;
  }
  loadingCurrent.value = false;
};

const viewEvent = async (event: any) => {
  if (!event?.eventSecret) return;

  loadingCurrent.value = true;

  try {
    await resetAllStores();
    await eventStore.fetchEventBySecret(event.eventSecret);
    activeEventId.value = event.id || event._id; 
    dialogStore.open(DIALOG_NAMES.EVENT_VIEW, {
      event: eventStore.currentEvent,
    });
  } catch (error) {
    console.error("Error loading event:", error);
  } finally {
    loadingCurrent.value = false;
  }
};

const editEvent = (event: any) => {
  dialogStore.setEditingEvent(event);
  dialogStore.open(DIALOG_NAMES.EVENT_FORM, { event });
};

const deleteEvent = (event: any) => {
  dialogStore.setDeletingEvent(event);
  dialogStore.open(DIALOG_NAMES.EVENT_DELETE, { event });
};

const cancelEvent = (event: any) => {
  dialogStore.setDeletingEvent(event);
  dialogStore.open(DIALOG_NAMES.EVENT_CANCEL, { event });
};

const manageOrg = (org: any) => { 
  orgStore.currentOrganization = org; 
};

const uploadMedia = (org: any) => {
  orgStore.currentOrganization = org;
  orgStore.showLegalUpload = true;
};

const getVoucher = (org: any) => {
  orgStore.currentOrganization = org;
  dialogStore.open(DIALOG_NAMES.VOUCHER, { organization: org });
};

const toggleViewOrgs = () => { 
  showOrgs.value = !showOrgs.value; 
};

const openCreateOrganization = () => dialogStore.openCreateOrganization(userStore.user?.id || "", { source: "events-management" });

const openCreateEvent = () => {
  dialogStore.open(DIALOG_NAMES.EVENT_FORM);
};

const exportEvents = () => {
  console.log("Export events", filteredEvents.value);
  // Implement actual export logic here
};

const handleDialogClose = (dialogName: string) => {
  useDialogStore().handleDialogClose(dialogName);
  
  if (dialogName === DIALOG_NAMES.EVENT_FORM) {
    dialogStore.setEditingEvent(null);
  } else if (dialogName === DIALOG_NAMES.EVENT_VIEW) {
    dialogStore.setViewingEvent(null);
  } else if (dialogName === DIALOG_NAMES.EVENT_DELETE) {
    dialogStore.setDeletingEvent(null);
  }
};

const handleFormSaved = async () => {
  dialogStore.close(DIALOG_NAMES.EVENT_FORM);
  await refreshAll();
  // Refresh org events if an organization is selected
  if (orgStore.currentOrganization) {
    await activateOrg(orgStore.currentOrganization);
  }
};

const handleDeleteConfirmed = async () => {
  dialogStore.close(DIALOG_NAMES.EVENT_DELETE);
  if (activeEventId.value && eventStore.deletingEvent?.id === activeEventId.value) {
    activeEventId.value = null;
    eventStore.currentEvent = null;
  }
  await refreshAll();
  // Refresh org events if an organization is selected
  if (orgStore.currentOrganization) {
    await activateOrg(orgStore.currentOrganization);
  }
};

// Menu items configuration
const menuItems = ref([
  {
    label: 'Manage Event',
    icon: 'mdi-tools',
    action: 'manage',
    handler: viewEvent,
    showDividerBefore: false,
    isDestructive: false
  },
  {
    label: 'Edit Event',
    icon: 'mdi-pencil',
    action: 'edit',
    handler: editEvent,
    showDividerBefore: false,
    isDestructive: false
  },
  {
    label: 'Cancel Event',
    icon: 'mdi-cancel',
    action: 'cancel',
    handler: cancelEvent,
    showDividerBefore: true,
    isDestructive: true
  },
  {
    label: 'Delete Event',
    icon: 'mdi-trash',
    action: 'delete',
    handler: deleteEvent,
    showDividerBefore: true,
    isDestructive: true
  }
]);

// Watch for user changes
watch(() => userStore.user?.id, async (id) => {
  if (id) {
    await refreshAll();
  }
}, { immediate: true });

// Lifecycle
onMounted(async () => {
  loadingInitial.value = true;
  try {
    await refreshAll();
  } finally {
    loadingInitial.value = false;
  }
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.organization-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 12px;
}

.organization-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.selected-org {
  border: 2px solid rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.active-event-chip {
  border: 2px solid rgb(var(--v-theme-success));
  font-weight: bold;
}

@media (max-width: 1264px) {
  .v-card-title {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .v-card-title .v-spacer {
    display: none;
  }
}
</style>

<style>
.v-data-table tbody tr:hover {
  background-color: rgba(60, 186, 198, 0.6) !important;
  border-left: 4px solid #3cbac6 !important;
  cursor: pointer;
}

.v-data-table tbody tr.active-row {
  background-color: rgba(60, 186, 198, 0.15) !important;
  border-left: 4px solid #3cbac6 !important;
}
</style>