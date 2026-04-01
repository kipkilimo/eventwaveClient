<template>
  <v-container fluid class="pa-sm-2 fill-width">
    <!-- Loading Indicator -->
    <v-progress-linear
      color="primary-darken-2"
      indeterminate
      v-if="loadingCurrent"
    ></v-progress-linear>

    <!-- Organizations Grid -->
    <v-row dense v-if="showOrgs">
      <v-col
        v-for="org in orgStore.organizations.slice(0, 6)"
        :key="org.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="d-flex"
      >
        <v-card
          elevation="2"
          class="flex-grow-1 organization-card"
          @click="activateOrg(org)"
          :class="{ 'selected-org': isSelected(org) }"
          hover
          ripple
        >
          <v-card-text class="pa-3">
            <div class="d-flex justify-space-between align-start mb-2">
              <div class="org-header">
                <div class="text-h6 font-weight-bold text-truncate">
                  {{ org.name }}
                </div>
                <div class="text-caption text-grey">
                  {{ org.orgType || "N/A" }} | Events :
                  {{ org.events?.length || 0 }} | Users:
                  {{ org.users?.length || 0 }} | Created:
                  {{ formatDate(org.createdAt) }}
                </div>
              </div>
              <v-chip
                size="small"
                color="indigo-lighten-4"
                class="text-indigo ml-2 org-tier-chip"
                variant="outlined"
                rounded="sm"
              >
                {{ org.subscriptionTier || "FREE" }}
              </v-chip>
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pt-0 pa-2">
            <v-spacer />
            <v-btn
              v-if="org.orgLegalDocuments?.length < 5"
              size="small"
              color="secondary"
              variant="outlined"
              prepend-icon="mdi-paperclip-check"
              @click.stop="uploadMedia(org)"
              :class="{ 'mobile-btn': $vuetify.display.mobile }"
            >
              Legal
            </v-btn>
            <v-btn
              size="small"
              color="primary"
              variant="outlined"
              prepend-icon="mdi-wrench-cog-outline"
              @click.stop="manageOrg(org)"
              :class="{ 'mobile-btn': $vuetify.display.mobile }"
            >
              Manage
            </v-btn>
            <v-btn
              size="small"
              color="success"
              variant="outlined"
              prepend-icon="mdi-ticket-percent-outline"
              @click.stop="getVoucher(org)"
              :class="{ 'mobile-btn': $vuetify.display.mobile }"
            >
              Voucher
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- HEADER SECTION -->
    <v-card class="mb-1 mt-2 mb-sm-3">
      <v-card-text class="pa-2">
        <v-row align="center" class="flex-column flex-sm-row">
          <v-col cols="12" sm="4" class="text-center text-sm-start">
            <div class="d-flex align-center justify-center justify-sm-start">
              <v-icon
                icon="mdi-calendar-multiple"
                size="32"
                class="mr-3 text-primary"
              ></v-icon>
              <div>
                <h1 class="text-h4 text-h5-sm font-weight-bold text-primary">
                  Event Management
                </h1>
                <p class="text-grey mb-0 text-caption text-body-2-sm">
                  Manage all events, facilitators, and schedules
                </p>
              </div>
            </div>
          </v-col>
          <v-row no-gutters>
            <!-- My Organizations -->
            <v-col cols="12" sm="4" class="text-center text-sm-start">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="tonal"
                    class="mr-4"
                    prepend-icon="mdi-bank"
                    @click="toggleViewOrgs"
                    size="large"  
                    :class="{ 'mobile-full-width': $vuetify.display.mobile }"
                  >
                    My Organizations ({{ orgStore.organizations.length }})
                  </v-btn>
                </template>
                <span>Manage organizations and their members</span>
              </v-tooltip>
            </v-col>
            <!-- Refresh -->
            <v-col cols="12" sm="4" class="text-center">
              <v-btn
                variant="tonal"
                prepend-icon="mdi-refresh"
                @click="loadEvents"
                size="large"
                :loading="loading"  
                :class="{ 'mobile-full-width': $vuetify.display.mobile }"
              >
                Refresh all
              </v-btn>
            </v-col>
          </v-row>
          <v-col cols="12" sm="4" class="text-center text-sm-end">
            <v-btn
              variant="tonal"
              color="#850a85"
              @click="openCreateOrganization"
              size="large"
              prepend-icon="mdi-bank-plus"
              class="flex-grow-1"
              block
              :class="{ 'mobile-full-width': $vuetify.display.mobile }"
            >
              Add Organization
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- FILTERS CARD -->
    <v-card class="mb-4 mb-sm-6">
      <v-card-text class="pa-3 pa-sm-4">
        <v-row dense>
          <v-col cols="12" sm="6" md="4" class="pb-2">
            <v-text-field
              v-model="search"
              label="Search events..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              class="mobile-full-width"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="2" class="pb-2">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              class="mobile-full-width"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2" class="pb-2">
            <v-select
              v-model="filters.sortBy"
              :items="sortOptions"
              label="Sort By"
              variant="outlined"
              density="compact"
              hide-details
              class="mobile-full-width"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="4" class="pb-2">
            <div class="d-flex flex-wrap gap-2 w-100">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-refresh"
                @click="loadEvents"
                size="small"
                :loading="loading"
                class="flex-grow-1"
                block
                :class="{ 'mobile-full-width': $vuetify.display.mobile }"
              >
                <span class="d-none d-sm-inline">My Events ({{ eventStore.events.length }})</span>
                <span class="d-sm-none">Refresh Events</span>
              </v-btn>
              <v-btn
                variant="tonal"
                prepend-icon="mdi-filter-variant"
                @click="showAdvancedFilters = !showAdvancedFilters"
                size="small"
                class="flex-grow-1"
                block
                :class="{ 'mobile-full-width': $vuetify.display.mobile }"
              >
                <span class="d-none d-sm-inline">More Filters</span>
                <span class="d-sm-none">Filters</span>
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Advanced Filters -->
        <v-expand-transition>
          <div v-if="showAdvancedFilters" class="mt-3">
            <v-row dense>
              <v-col cols="12" sm="6" md="3" class="pb-2">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="filters.createdAfter"
                      label="Created After"
                      variant="outlined"
                      density="compact"
                      readonly
                      v-bind="props"
                      hide-details
                      class="mobile-full-width"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="filters.createdAfter"></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" sm="6" md="3" class="pb-2">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="filters.createdBefore"
                      label="Created Before"
                      variant="outlined"
                      density="compact"
                      readonly
                      v-bind="props"
                      hide-details
                      class="mobile-full-width"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="filters.createdBefore"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <!-- EVENTS TABLE -->
    <v-card class="mt-2">
      <v-card-title class="d-flex align-center pa-3 pa-sm-4">
        <v-icon icon="mdi-calendar-multiple" class="mr-2"></v-icon>
        <span class="text-h6 font-weight-medium">
          Events ({{ eventStore.events.length }})
        </span>
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          size="small"
          prepend-icon="mdi-download"
          @click="exportEvents"
          class="d-none d-sm-flex"
        >
          Export
        </v-btn>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="exportEvents"
          class="d-sm-none"
        >
          <v-icon>mdi-download</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Mobile Cards View -->
      <div class="d-block d-sm-none pa-3">
        <div v-if="loading" class="py-8 text-center">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
        <div
          v-else-if="eventStore.events.length === 0"
          class="py-8 text-center"
        >
          <v-icon size="64" class="mb-2 text-grey-lighten-1"
            >mdi-calendar-remove</v-icon
          >
          <div class="text-h6 text-grey">No events found</div>
          <div class="text-grey mt-1">
            Create your first event to get started
          </div>
        </div>
        <v-card
          v-for="event in eventStore.events"
          :key="event.id"
          class="mb-3 event-card-mobile"
          :class="getRowClass(event, eventStore.events.indexOf(event))"
          @click="setActiveEvent(event)"
        >
          <v-card-text class="pa-3">
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="d-flex align-center mb-1">
                  <v-icon
                    :icon="getStatusIcon(event.status)"
                    :color="getStatusColor(event.status)"
                    size="small"
                    class="mr-2"
                  ></v-icon>
                  <div class="text-body-1 font-weight-medium">
                    {{ event.title }}
                  </div>
                </div>
                <div class="text-caption text-grey mb-1">
                  Key: {{ event.eventSecret }}
                </div>
              </div>
              <v-chip
                :color="getChipStatusColor(isActive(event))"
                variant="flat"
                size="small"
                class="text-capitalize"
                :class="{ 'active-event-chip': isActive(event) }"
              >
                {{ event.status.toLowerCase() }}
                <span v-if="isActive(event)" class="ml-1">(Active)</span>
              </v-chip>
            </div>

            <v-divider class="my-2"></v-divider>

            <div class="mobile-event-details">
              <div class="detail-row">
                <v-icon size="small" class="mr-2 text-grey">mdi-account</v-icon>
                <span class="text-caption">{{
                  event.organizer?.name || "N/A"
                }}</span>
              </div>
              <div class="detail-row">
                <v-icon size="small" class="mr-2 text-grey"
                  >mdi-account-group</v-icon
                >
                <span class="text-caption">
                  {{ event.facilitators?.length || 0 }} facilitators
                </span>
              </div>
              <div class="detail-row">
                <v-icon size="small" class="mr-2 text-grey"
                  >mdi-calendar-clock</v-icon
                >
                <span class="text-caption">
                  {{ getEventTimingStatus(event).text }}
                </span>
              </div>
            </div>

            <v-divider class="my-2"></v-divider>

            <div class="d-flex justify-end gap-1">
              <v-btn
                icon
                size="small"
                variant="text"
                color="info"
                @click.stop="viewEvent(event)"
              >
                <v-icon>mdi-tools</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                variant="text"
                color="primary"
                @click.stop="editEvent(event)"
              >
                <v-icon>mdi-text-box-edit-outline</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                variant="text"
                color="error"
                @click.stop="deleteEvent(event)"
              >
                <v-icon>mdi-close-network-outline</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Desktop Table View -->
      <v-data-table
        class="d-none d-sm-block"
        style="height: calc(100vh - 36vh); overflow-y: auto"
        :headers="headers"
        :items="eventStore.events"
        :search="search"
        :loading="loading"
        :items-per-page="pagination.itemsPerPage"
        :page="pagination.page"
        :item-class="(item: any, index: number) => getRowClass(item, index)"
        density="comfortable"
        item-value="id"
      >
        <!-- Loading State -->
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>

        <!-- No Data State -->
        <template v-slot:no-data>
          <div class="py-8 text-center">
            <v-icon size="64" class="mb-2 text-grey-lighten-1"
              >mdi-calendar-remove</v-icon
            >
            <div class="text-h6 text-grey">No events found</div>
            <div class="text-grey mt-1">
              Create your first event to get started
            </div>
          </div>
        </template>

        <!-- Event Title Column -->
        <template v-slot:item.title="{ item }">
          <div class="d-flex align-center">
            <v-icon
              :icon="getStatusIcon(item.status)"
              :color="getStatusColor(item.status)"
              size="small"
              class="mr-2"
            ></v-icon>
            <div>
              <div class="font-weight-medium text-body-2">{{ item.title }}</div>
              <div class="text-caption text-grey">
                Key: {{ item.eventSecret }}
              </div>
            </div>
          </div>
        </template>

        <!-- Organizer Column -->
        <template v-slot:item.organizer="{ item }">
          <div class="d-flex align-center">
            <span class="text-body-2">{{ item.organizer?.name || "N/A" }}</span>
          </div>
        </template>

        <!-- Facilitators Column -->
        <template v-slot:item.facilitators="{ item }">
          <div v-if="item.facilitators?.length">
            <v-chip
              v-for="facilitator in item.facilitators.slice(0, 2)"
              :key="facilitator.id"
              size="small"
              variant="outlined"
              class="mr-1 mb-1"
            >
              {{ facilitator.name }}
            </v-chip>
            <v-chip
              v-if="item.facilitators.length > 2"
              size="small"
              variant="tonal"
              color="grey"
            >
              +{{ item.facilitators.length - 2 }} more
            </v-chip>
          </div>
          <span v-else class="text-grey text-caption">No facilitators</span>
        </template>

        <!-- Status Column - Updated with active indicator -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getChipStatusColor(isActive(item))"
            variant="flat"
            size="small"
            class="text-capitalize"
            @click="setActiveEvent(item)"
            :class="{ 'active-event-chip': isActive(item) }"
          >
            {{ item.status.toLowerCase() }}
            <span v-if="isActive(item)" class="ml-1">(Active)</span>
          </v-chip>
        </template>

        <!-- Timing Column -->
        <template v-slot:item.timing="{ item }">
          <div class="text-body-2">
            <div>
              {{ formatDateTime(item.dateTime.start) }}
              <v-chip
                :color="getEventTimingStatus(item).color"
                variant="flat"
                size="x-small"
                class="mt-0"
              >
                {{ getEventDuration(item) }} |
                {{ getEventTimingStatus(item).text }}
              </v-chip>
            </div>
          </div>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="small"
                  variant="text"
                  color="info"
                  @click="dialogStore.open(DIALOG_NAMES.EVENT_VIEW, { item });"
                >
                  <v-icon>mdi-tools</v-icon>
                </v-btn>
              </template>
              <span>Set Current & Manage Event</span>
            </v-tooltip>

            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  @click="editEvent(item)"
                >
                  <v-icon>mdi-text-box-edit-outline</v-icon>
                </v-btn>
              </template>
              <span>Edit Event</span>
            </v-tooltip>

            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteEvent(item)"
                >
                  <v-icon>mdi-close-network-outline</v-icon>
                </v-btn>
              </template>
              <span>Cancel Event</span>
            </v-tooltip>
          </div>
        </template>

        <!-- Custom Footer with Pagination -->
        <template v-slot:bottom>
          <div class="d-flex align-center pa-3 table-footer">
            <span class="text-caption text-grey">
              Showing
              {{ Math.min(eventStore.events.length, pagination.itemsPerPage) }}
              of {{ eventStore.events.length }} events
            </span>
            <v-spacer></v-spacer>
            <v-pagination
              v-model="pagination.page"
              :length="
                Math.ceil(eventStore.events.length / pagination.itemsPerPage)
              "
              density="comfortable"
              class="table-pagination"
            ></v-pagination>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- DIALOGS -->
    <v-dialog v-model="showCreateOrganization" max-width="630" persistent>
      <CreateOrganization />
    </v-dialog>
    
    <v-dialog v-model="showLegalDocs" max-width="630" persistent>
      <LegalDocs />
    </v-dialog>
    
    <v-dialog v-model="showOrgDetails" max-width="630">
      <OrgDetails />
    </v-dialog>
    
    <v-dialog v-model="showVoucherDialog" width="66rem">
      <ProGenerateVoucher />
    </v-dialog>
    
    <v-dialog v-model="showEventForm" max-width="800" persistent>
      <EventFormDialog
        @saved="handleFormSaved"
        @cancel="handleDialogClose(DIALOG_NAMES.EVENT_FORM)"
      />
    </v-dialog>

    <v-dialog v-model="showEventView" max-width="75%" persistent>
      <EventViewDialog @close="handleDialogClose(DIALOG_NAMES.EVENT_VIEW)" />
    </v-dialog>

    <v-dialog v-model="showEventDelete" max-width="500" persistent>
      <EventDeleteDialog
        @confirmed="handleDeleteConfirmed"
        @cancel="handleDialogClose(DIALOG_NAMES.EVENT_DELETE)"
      />
    </v-dialog>
  </v-container>
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

// -------------------------------------------------------
// TYPES
// -------------------------------------------------------
interface User {
  id: string;
  name: string;
  email?: string;
}

interface Facilitator {
  id: string;
  name: string;
}

interface EventType {
  id: string;
  title: string;
  eventSecret?: string;
  organizer?: User | null;
  facilitators?: Facilitator[];
  status: "ACTIVE" | "DRAFT" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  startDate?: string | null;
  dateTime: {
    start: string;
    end: string;
  };
}

// -------------------------------------------------------
// STORES
// -------------------------------------------------------
const userStore = useUserStore();
const eventStore = useEventStore();
const dialogStore = useDialogStore();
const orgStore = useOrganizationStore();
const playerStore = usePlayerStore();
const livefeedStore = useLiveFeedStore();
const qnaStore = useQnAStore();
const feedbackStore = useFeedbackStore();

// -------------------------------------------------------
// UI STATE
// -------------------------------------------------------
const loading = ref(false);
const search = ref("");
const showAdvancedFilters = ref(false);
const loadingCurrent = ref(false);

const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
});

const filters = reactive({
  status: null as EventType["status"] | null,
  organizer: null as string | null,
  sortBy: "createdAt" as string,
  dateRange: null as [string, string] | null,
  createdAfter: null as string | null,
  createdBefore: null as string | null,
});

// Updated getRowClass to include active class
const getRowClass = (item: any, index: number) => {
  const baseClass = index % 2 === 0 ? "even-row" : "odd-row";
  return isActive(item) ? `${baseClass} active-row` : baseClass;
};

const activeRow = ref<EventType | null>(null);

const isActive = (item: any) => {
  if (!activeRow.value) return false;
  const activeId = activeRow.value.id || (activeRow.value as any)._id;
  const itemId = item.id || item._id;
  return activeId === itemId;
};

// -------------------------------------------------------
// DIALOG COMPUTED PROPERTIES - Using dialogStore
// -------------------------------------------------------
const showEventForm = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.EVENT_FORM),
  set: (val) => {
    if (!val) handleDialogClose(DIALOG_NAMES.EVENT_FORM);
  },
});

const showEventView = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.EVENT_VIEW),
  set: (val) => {
    if (!val) handleDialogClose(DIALOG_NAMES.EVENT_VIEW);
  },
});

const showEventDelete = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.EVENT_DELETE),
  set: (val) => {
    if (!val) handleDialogClose(DIALOG_NAMES.EVENT_DELETE);
  },
});

const showCreateOrganization = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.CREATE_ORGANIZATION),
  set: (val) => {
    if (!val) dialogStore.closeCreateOrganization();
  },
});

const showVoucherDialog = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.VOUCHER),
  set: (val) => {
    if (!val) dialogStore.closeVoucher();
  },
});

// These dialogs still need to be migrated to dialogStore
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
  set: (val) => {
    if (!val) orgStore.dialogDetailOpen = false;
  },
});

// Removed showManageEvent - now using dialogStore

// -------------------------------------------------------
// FILTER OPTIONS
// -------------------------------------------------------
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

// -------------------------------------------------------
// TABLE HEADERS
// -------------------------------------------------------
const headers = [
  { title: "Event", key: "title", sortable: true, width: "250px" },
  { title: "Organizer", key: "organizer", sortable: true },
  { title: "Facilitators", key: "facilitators", sortable: false },
  { title: "Status", key: "status", sortable: true },
  { title: "Timing", key: "timing", sortable: true },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
    align: "end",
    width: "150px",
  },
];

// -------------------------------------------------------
// LIFECYCLE
// -------------------------------------------------------
onMounted(async () => {
  try {
    await resetAllStores();
    await userStore.refreshDashboard();
    await loadEvents();
    eventStore.currentEvent = eventStore.events[0] || null;
    activeRow.value = eventStore.currentEvent;
  } catch (err) {
    console.error("❌ Error in onMounted lifecycle:", err);
  }
});

// -------------------------------------------------------
// EVENT ACTIONS - UPDATED
// -------------------------------------------------------

// Updated viewEvent to use dialogStore
const viewEvent = async (event: EventType) => {
  await eventStore.fetchEventBySecret(event?.eventSecret || "");
  // Use dialogStore instead of eventStore.managingEvent
  //dialogStore.open(DIALOG_NAMES.EVENT_VIEW, { event });
};

const getChipStatusColor = (active: boolean) => {
  return active ? "success" : "grey-lighten-4";
};

// Updated setActiveEvent to properly set the current event and show management dialog
const setActiveEvent = async (eventRow: EventType) => {
  loadingCurrent.value = true;
  console.log("Set active event:", eventRow);
  
  if (!eventRow?.eventSecret) {
    loadingCurrent.value = false;
    return;
  }

  await resetAllStores();
  await eventStore.fetchEventBySecret(eventRow.eventSecret);
  activeRow.value = eventStore.currentEvent;
  
  // Open the manage event dialog after setting active event
  // if (eventStore.currentEvent) {
  //   dialogStore.open(DIALOG_NAMES.EVENT_VIEW, { event: eventStore.currentEvent });
  // }
  
  loadingCurrent.value = false;
};

const editEvent = (event: EventType) => {
  eventStore.setEditingEvent(event);
  dialogStore.open(DIALOG_NAMES.EVENT_FORM, { event });
};

const deleteEvent = (event: EventType) => {
  eventStore.setDeletingEvent(event);
  dialogStore.open(DIALOG_NAMES.EVENT_DELETE, { event });
};

function handleDialogClose(dialogName: string) {
  dialogStore.close(dialogName);
  if (dialogName === DIALOG_NAMES.EVENT_FORM) {
    eventStore.setEditingEvent(null);
  }
  if (dialogName === DIALOG_NAMES.EVENT_VIEW) {
    eventStore.setViewingEvent(null);
    // Don't clear activeRow when closing view dialog
  }
  if (dialogName === DIALOG_NAMES.EVENT_DELETE) {
    eventStore.setDeletingEvent(null);
  }
}

async function handleFormSaved() {
  dialogStore.close(DIALOG_NAMES.EVENT_FORM);
  await userStore.refreshDashboard();
  await resetAllStores();
  // Refresh events after form save
  await loadEvents();
}

async function handleDeleteConfirmed() {
  dialogStore.close(DIALOG_NAMES.EVENT_DELETE);
  await userStore.refreshDashboard();
  await resetAllStores();
  // Clear active row if the deleted event was active
  if (activeRow.value && eventStore.deletingEvent?.id === activeRow.value.id) {
    activeRow.value = null;
    eventStore.currentEvent = null;
  }
  await loadEvents();
}

const activateOrg = async (org: any | null) => {
  if (!org) return;
  await resetAllStores();
  orgStore.currentOrganization = org;
  loadOrgEvents(org);
};

// -------------------------------------------------------
// RESET ALL STORES
// -------------------------------------------------------
async function resetAllStores(): Promise<void> {
  try {
    console.log("🔄 Resetting all stores...");
    if (livefeedStore.$reset) livefeedStore.$reset();
    if (qnaStore.$reset) qnaStore.$reset();
    if (feedbackStore.$reset) feedbackStore.$reset();
    if (playerStore.$reset) playerStore.$reset();
    console.log("✅ All stores reset successfully");
  } catch (error) {
    console.error("Failed to reset stores:", error);
  }
}

// -------------------------------------------------------
// LOAD EVENTS - UPDATED
// -------------------------------------------------------
const loadEvents = async () => {
  loading.value = true;
  const userId = userStore.user?.id;
  if (!userId) {
    console.warn("No logged in user.");
    loading.value = false;
    return;
  }

  try {
    await orgStore.fetchMyOrganizations(userId);
    await eventStore.fetchUserFacilitatingEvents(userId);
    
    // If there's an active event, try to find it in the loaded events
    if (activeRow.value) {
      const foundEvent = eventStore.events.find(e => 
        (e.id === activeRow.value.id) || (e.eventSecret === activeRow.value.eventSecret)
      );
      if (!foundEvent) {
        activeRow.value = null;
        eventStore.currentEvent = null;
      }
    }
  } catch (err) {
    console.error("Failed to load events:", err);
  } finally {
    loading.value = false;
  }
};

const loadOrgEvents = async (org: { id: string }) => {
  loading.value = true;
  if (!org?.id) {
    console.warn("loadOrgEvents: Missing organization or organization.id");
    loading.value = false;
    return;
  }

  try {
    await eventStore.fetchOrganizationEvents(org.id);
  } catch (err) {
    console.error("Failed to load organization events:", err);
  }

  loading.value = false;
};

// Watch for user changes
watch(
  () => userStore.user?.id,
  async (id) => {
    if (id) {
      await userStore.refreshDashboard();
      await resetAllStores();
      await loadEvents();
    }
  },
  { immediate: true },
);

// Add watch for events to update active row if needed
watch(
  () => eventStore.events,
  (events) => {
    if (activeRow.value && !events.find(e => e.id === activeRow.value.id)) {
      activeRow.value = null;
      eventStore.currentEvent = null;
    }
  },
  { deep: true }
);

const showOrgs = ref(false);
function toggleViewOrgs() {
  showOrgs.value = !showOrgs.value;
}

// -------------------------------------------------------
// UTILITIES
// -------------------------------------------------------
const clearFilters = () => {
  search.value = "";
  filters.status = null;
  filters.organizer = null;
  filters.sortBy = "createdAt";
  filters.dateRange = null;
  filters.createdAfter = null;
  filters.createdBefore = null;
};

const getStatusColor = (status: EventType["status"]) => {
  const colors = {
    ACTIVE: "green",
    DRAFT: "grey",
    COMPLETED: "blue",
    CANCELLED: "red",
  };
  return colors[status] || "grey";
};

const getStatusIcon = (status: EventType["status"]) => {
  const icons = {
    ACTIVE: "mdi-check-circle",
    DRAFT: "mdi-pencil",
    COMPLETED: "mdi-flag-checkered",
    CANCELLED: "mdi-cancel",
  };
  return icons[status] || "mdi-calendar";
};

// -------------------------------------------------------
// DATE/TIME FUNCTIONS
// -------------------------------------------------------
const formatDate = (dateString: string | number | Date) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateString: string | number | Date) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getEventTimingStatus = (event: EventType) => {
  if (!event?.dateTime?.start || !event?.dateTime?.end) {
    return { status: "N/A", text: "No date information", color: "grey" };
  }

  const now = new Date();
  const start = new Date(event.dateTime.start);
  const end = new Date(event.dateTime.end);

  if (now > end) {
    const timeDiff = Math.floor((now.getTime() - end.getTime()) / 1000);
    let text = "";

    if (timeDiff < 60) {
      text = `Ended ${timeDiff} seconds ago`;
    } else if (timeDiff < 3600) {
      text = `Ended ${Math.floor(timeDiff / 60)} minutes ago`;
    } else if (timeDiff < 86400) {
      text = `Ended ${Math.floor(timeDiff / 3600)} hours ago`;
    } else {
      text = `Ended ${Math.floor(timeDiff / 86400)} days ago`;
    }

    return { status: "ended", text, color: "red" };
  }

  if (now >= start && now <= end) {
    return { status: "ongoing", text: "Ongoing", color: "green" };
  }

  if (now < start) {
    const timeDiff = Math.floor((start.getTime() - now.getTime()) / 1000);
    let text = "";

    if (timeDiff < 60) {
      text = `Starts in ${timeDiff} seconds`;
    } else if (timeDiff < 3600) {
      const minutes = Math.floor(timeDiff / 60);
      text = `Starts in ${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else if (timeDiff < 86400) {
      const hours = Math.floor(timeDiff / 3600);
      text = `Starts in ${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
      const days = Math.floor(timeDiff / 86400);
      text = `Starts in ${days} day${days > 1 ? "s" : ""}`;
    }

    return { status: "upcoming", text, color: "blue" };
  }

  return { status: "unknown", text: "Unknown", color: "grey" };
};

const getEventDuration = (event: EventType) => {
  if (!event?.dateTime?.start || !event?.dateTime?.end) {
    return "Duration: N/A";
  }

  const start = new Date(event.dateTime.start);
  const end = new Date(event.dateTime.end);
  const diffMs = end.getTime() - start.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr ${minutes} min`;
  }
};

// -------------------------------------------------------
// EXPORT & HELPERS
// -------------------------------------------------------
function exportEvents() {
  console.log("TODO: implement exportEvents()");
}

const isSelected = (org: any) => {
  return org?.id === orgStore.currentOrganization?.id;
};

const uploadMedia = (org: any) => {
  orgStore.currentOrganization = org;
  console.log("Upload media for:", org.name);
  orgStore.showLegalUpload = true;
};

const manageOrg = (org: any) => {
  orgStore.currentOrganization = org;
  console.log("Manage organization:", org.name);
};

const getVoucher = (org: any) => {
  orgStore.currentOrganization = org;
  dialogStore.open(DIALOG_NAMES.VOUCHER, { organization: org });
};

const openCreateOrganization = () => {
  dialogStore.openCreateOrganization(userStore.user?.id || "", {
    source: "events-management",
  });
};
</script>

<style scoped>
.fill-width {
  width: 100%;
}

@media (max-width: 600px) {
  .mobile-full-width {
    width: 100%;
    margin-bottom: 8px;
  }

  .mobile-btn {
    margin: 4px 0 !important;
    width: 100%;
  }

  .organization-toggle {
    padding: 12px;
    margin: 8px 0;
  }

  .text-h5-sm {
    font-size: 1.25rem !important;
  }

  .text-body-2-sm {
    font-size: 0.75rem !important;
  }
}

.organization-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
}

.organization-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.selected-org {
  border: 2px solid rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.org-header {
  min-width: 0;
}

.org-tier-chip {
  flex-shrink: 0;
}

.event-card-mobile {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.event-card-mobile:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.mobile-event-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
}

.detail-row {
  display: flex;
  align-items: center;
}

.table-footer {
  background-color: rgba(var(--v-theme-primary), 0.02);
  border-top: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.table-pagination :deep(.v-pagination__item) {
  border-radius: 8px;
  margin: 0 2px;
}

.table-pagination :deep(.v-pagination__item--is-active) {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

/* Active Event Chip Styles */
.active-event-chip {
  border: 2px solid rgb(var(--v-theme-success));
  font-weight: bold;
  transition: all 0.2s ease;
}

.active-event-chip:hover {
  transform: scale(1.02);
}

@media (max-width: 960px) {
  .text-h5-sm {
    font-size: 1.5rem !important;
  }

  .text-body-2-sm {
    font-size: 0.875rem !important;
  }
}
</style>

<style>
.v-data-table tbody tr:hover {
  background-color: rgba(60, 186, 198, 0.6) !important;
  border-left: 4px solid #3cbac6 !important;
  border-right: 4px solid #3cbac6 !important;
  cursor: pointer;
}

.v-data-table tbody tr {
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease;
}

/* Active row styling */
.v-data-table tbody tr.active-row {
  background-color: rgba(60, 186, 198, 0.15) !important;
  border-left: 4px solid #3cbac6 !important;
}
</style>