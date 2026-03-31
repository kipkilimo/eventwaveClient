<template>
  <v-container fluid class="pa-0 ma-0">
    <!-- ===========================
         FACILITATOR DASHBOARD HEADER
         =========================== -->
    <v-card flat class="rounded-0" color="surface">
      <v-card-text class="pa-4">
        <v-row justify="space-between" align="center" class="mb-4">
          <div>
            <div class="text-h5 font-weight-bold text-primary">
              Feedback Management Dashboard
            </div>
            <div class="text-caption text-medium-emphasis">
              Manage feedback forms, analyze responses, and monitor engagement
            </div>
          </div>

          <v-btn
            color="orange"
            @click="openNewFeedbackDialog"
            prepend-icon="mdi-plus"
            :loading="submitting"
          >
            New Feedback Form
          </v-btn>
        </v-row>

        <!-- Summary Statistics --> 

        <v-divider class="my-4" />

        <!-- ===========================
             QUICK ACTIONS & FILTERS
             =========================== -->
        <v-row class="mb-6" align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              density="compact"
              placeholder="Search feedback forms..."
              prepend-inner-icon="mdi-magnify"
              hide-details
              variant="outlined"
              clearable
            />
          </v-col>
          <v-col cols="12" md="6">
            <div class="d-flex align-center">
              <v-chip-group v-model="filterStatus" multiple>
                <v-chip
                  v-for="status in statusOptions"
                  :key="status.value"
                  :value="status.value"
                  :color="status.color"
                  variant="outlined"
                  size="small"
                  filter
                >
                  {{ status.label }}
                </v-chip>
              </v-chip-group>
              <v-spacer />
              <v-btn
                icon
                variant="text"
                @click="refreshFeedbacks"
                :loading="loading"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- ===========================
             FEEDBACK FORMS GRID
             =========================== -->
        <v-row v-if="!loading && filteredFeedbacks.length > 0">
          <v-col
            v-for="feedback in filteredFeedbacks"
            :key="feedback.id"
            cols="12"
            md="6"
            lg="4"
          >
            <!-- FEEDBACK CARD -->
            <v-card class="feedback-card" :class="{ 'active-card': feedback.status === 'active' }">
              <!-- Card Header -->
              <v-card-title class="d-flex justify-space-between align-start pa-4 pb-2">
                <div
                  class="text-truncate text-h6 font-weight-medium"
                  :title="feedback.title"
                >
                  {{ feedback.title }}
                </div>

                <div class="d-flex align-center">
                  <v-chip
                    :color="getStatusColor(feedback.status)"
                    size="small"
                    class="mr-2 font-weight-medium"
                    density="comfortable"
                  >
                    {{ feedback.status.toUpperCase() }}
                  </v-chip>

                  <v-menu offset-y>
                    <template v-slot:activator="{ props }">
                      <v-btn icon size="small" v-bind="props" density="comfortable">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        @click="viewFeedbackDetails(feedback)"
                        prepend-icon="mdi-eye"
                      >
                        <v-list-item-title>View Details</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        @click="editFeedback(feedback)"
                        prepend-icon="mdi-pencil"
                      >
                        <v-list-item-title>Edit</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        @click="toggleFeedbackStatus(feedback)"
                        :prepend-icon="feedback.status === 'active' ? 'mdi-pause' : 'mdi-play'"
                      >
                        <v-list-item-title>
                          {{ feedback.status === "active" ? "Pause" : "Activate" }}
                        </v-list-item-title>
                      </v-list-item>
                      <v-divider />
                      <v-list-item
                        @click="deleteFeedback(feedback)"
                        prepend-icon="mdi-delete"
                        class="text-error"
                      >
                        <v-list-item-title>Delete</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </v-card-title>

              <!-- Card Content -->
              <v-card-text class="flex-grow-1 pa-4 pt-0">
                <!-- Target Info -->
                <div class="d-flex align-center mb-3">
                  <v-icon size="small" class="mr-2 text-primary">mdi-target</v-icon>
                  <span class="text-caption text-medium-emphasis">
                    {{ feedback.targetType || "General" }} •
                    {{ feedback.targetId || "All" }}
                  </span>
                </div>

                <!-- Description -->
                <p class="text-body-2 text-medium-emphasis mb-4 line-clamp-2">
                  {{ feedback.description || "No description provided" }}
                </p>

                <!-- Stats Row -->
                <v-row no-gutters class="mb-3">
                  <v-col cols="6" class="pr-2">
                    <v-card variant="flat" color="surface" class="pa-2 rounded">
                      <div class="d-flex align-center">
                        <v-icon size="small" color="blue" class="mr-2"
                          >mdi-account-group</v-icon
                        >
                        <div>
                          <div class="text-subtitle-2 font-weight-bold">
                            {{ feedback.totalParticipants || 0 }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Participants
                          </div>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="6" class="pl-2">
                    <v-card variant="flat" color="surface" class="pa-2 rounded">
                      <div class="d-flex align-center">
                        <v-icon size="small" color="green" class="mr-2"
                          >mdi-chart-bar</v-icon
                        >
                        <div>
                          <div class="text-subtitle-2 font-weight-bold">
                            {{
                              feedback.averageRating
                                ? feedback.averageRating.toFixed(1)
                                : "N/A"
                            }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Avg Rating
                          </div>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Questions Count -->
                <div class="d-flex align-center mb-2">
                  <v-icon size="small" color="orange" class="mr-2"
                    >mdi-help-circle</v-icon
                  >
                  <span class="text-caption"
                    >{{ feedback.totalQuestions || 0 }} questions</span
                  >
                </div>

                <!-- Dates -->
                <div class="text-caption text-medium-emphasis mb-3">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="x-small" class="mr-1">mdi-calendar-plus</v-icon>
                    <span>Created: {{ formatDate(feedback.createdAt) }}</span>
                  </div>
                  <div v-if="feedback.closesAt" class="d-flex align-center">
                    <v-icon size="x-small" class="mr-1">mdi-calendar-clock</v-icon>
                    <span>Closes: {{ formatDate(feedback.closesAt) }}</span>
                  </div>
                </div>

                <!-- Tags -->
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-if="feedback.isAnonymous"
                    small
                    density="comfortable"
                    color="grey"
                    variant="outlined"
                  >
                    <v-icon size="small" left>mdi-incognito</v-icon>
                    Anonymous
                  </v-chip>
                  <v-chip
                    v-if="feedback.isRequired"
                    small
                    density="comfortable"
                    color="red"
                    variant="outlined"
                  >
                    <v-icon size="small" left>mdi-alert</v-icon>
                    Required
                  </v-chip>
                </div>
              </v-card-text>

              <!-- Card Actions -->
              <v-card-actions class="pa-4 pt-0">
                <v-btn
                  color="primary"
                  variant="outlined"
                  block
                  @click="viewFeedbackDetails(feedback)"
                  :loading="loading"
                  prepend-icon="mdi-chart-box"
                  size="small"
                >
                  View Analytics
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Empty State -->
    <div v-if="!loading && filteredFeedbacks.length === 0">
      <v-card class="my-6">
        <v-card-text class="text-center py-12">
          <v-icon size="64" color="grey-lighten-1" class="mb-4"
            >mdi-clipboard-text-outline</v-icon
          >
          <div class="text-h6 text-grey mb-2">No feedback forms found</div>
          <p class="text-grey" v-if="searchQuery || filterStatus.length > 0">
            No forms match your search criteria. Try adjusting your filters.
          </p>
          <p class="text-grey" v-else>
            Create your first feedback form to start collecting responses
          </p>
          <v-btn
            color="orange"
            @click="openNewFeedbackDialog"
            class="mt-4"
            prepend-icon="mdi-plus"
          >
            Create Feedback
          </v-btn>
        </v-card-text>
      </v-card>
    </div>

    <!-- Loading State -->
    <v-row v-if="loading" class="ma-0">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular indeterminate size="64" color="orange" />
        <div class="text-h6 mt-4">Loading feedback forms...</div>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-if="error && !loading" class="ma-0">
      <v-col cols="12">
        <v-alert type="error" variant="tonal">
          <div class="d-flex align-center justify-space-between">
            <div>
              <strong>Error loading feedback forms:</strong> {{ error }}
            </div>
            <v-btn @click="refreshFeedbacks" variant="text" size="small">
              <v-icon left>mdi-refresh</v-icon>
              Retry
            </v-btn>
          </div>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog.show" max-width="60%">
      <CreateFeedbackForm />
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6">{{ confirmDialog.title }}</v-card-title>
        <v-card-text>{{ confirmDialog.message }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="confirmDialog.show = false">Cancel</v-btn>
          <v-btn
            color="error"
            @click="confirmDialog.action"
            :loading="confirmDialog.loading"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { format } from "date-fns";
import { useFeedbackStore } from "@/stores/feedback";
import { useEventStore } from "@/stores/event";
import CreateFeedbackForm from "@/components/dialogs/forms/CreateFeedbackItems.vue";
import type { Feedback } from "@/types/feedback.types";

// Store references
const feedbackStore = useFeedbackStore();
const eventStore = useEventStore();

// Reactive state
const searchQuery = ref("");
const filterStatus = ref<string[]>([]);
const dialog = ref({
  show: false,
  loading: false,
  editFeedback: null as Feedback | null,
});
const confirmDialog = ref({
  show: false,
  title: "",
  message: "",
  action: () => {},
  loading: false,
});

// Status options for filtering
const statusOptions = [
  { label: 'Active', value: 'active', color: 'success' },
  { label: 'Draft', value: 'draft', color: 'warning' },
  { label: 'Closed', value: 'closed', color: 'grey' },
  { label: 'Archived', value: 'archived', color: 'orange' },
];

// Computed properties from store
const loading = computed(() => feedbackStore.loading);
const submitting = computed(() => feedbackStore.submitting);
const error = computed(() => feedbackStore.error);
const feedbacks = computed(() => feedbackStore.feedbacks);

// Summary statistics
const summaryStats = computed(() => [
  {
    label: "Total Forms",
    value: feedbacks.value.length,
    icon: "mdi-clipboard-text-multiple",
    color: "surface",
    iconColor: "blue",
  },
  {
    label: "Active Forms",
    value: feedbacks.value.filter((f) => f.status === "active").length,
    icon: "mdi-play-circle",
    color: "surface",
    iconColor: "green",
  },
  {
    label: "Avg Rating",
    value: averageRating.value.toFixed(1),
    icon: "mdi-star",
    color: "surface",
    iconColor: "orange",
  },
  {
    label: "Completion",
    value: `${completionRate.value}%`,
    icon: "mdi-check-circle",
    color: "surface",
    iconColor: "green",
  },
]);

const totalSubmissions = computed(() =>
  feedbacks.value.reduce((sum, f) => sum + (f.totalResponses || 0), 0)
);

const completionRate = computed(() => {
  const totalResponses = feedbacks.value.reduce(
    (sum, f) => sum + (f.totalResponses || 0),
    0
  );
  const totalParticipants = feedbacks.value.reduce(
    (sum, f) => sum + (f.totalParticipants || 0),
    0
  );
  if (totalParticipants === 0) return 0;
  return Math.round((totalResponses / totalParticipants) * 100);
});

const averageRating = computed(() => {
  const ratedFeedbacks = feedbacks.value.filter((f) => f.averageRating != null);
  if (ratedFeedbacks.length === 0) return 0;
  const sum = ratedFeedbacks.reduce(
    (total, f) => total + (f.averageRating || 0),
    0
  );
  return sum / ratedFeedbacks.length;
});

const filteredFeedbacks = computed(() => {
  let filtered = [...feedbacks.value];

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (f) =>
        f.title.toLowerCase().includes(query) ||
        f.description?.toLowerCase().includes(query) ||
        f.targetType?.toLowerCase().includes(query)
    );
  }

  // Apply status filters
  if (filterStatus.value.length > 0) {
    filtered = filtered.filter((f) => filterStatus.value.includes(f.status));
  }

  // Sort by creation date (newest first)
  return filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});

// Methods
const openNewFeedbackDialog = () => {
  dialog.value.editFeedback = null;
  dialog.value.show = true;
};

const editFeedback = (feedback: Feedback) => {
  dialog.value.editFeedback = { ...feedback };
  dialog.value.show = true;
};

const closeDialog = () => {
  dialog.value.show = false;
  dialog.value.editFeedback = null;
};

const handleDialogSuccess = async () => {
  await refreshFeedbacks();
  closeDialog();
};

const viewFeedbackDetails = (feedback: Feedback) => {
  // Store the current feedback for detailed view
  feedbackStore.currentFeedback = feedback;
  // Navigate to detailed view or show analytics
  console.log("Viewing feedback details:", feedback.id);
};

const toggleFeedbackStatus = (feedback: Feedback) => {
  confirmDialog.value = {
    show: true,
    title:
      feedback.status === "active"
        ? "Pause Feedback Form?"
        : "Activate Feedback Form?",
    message:
      feedback.status === "active"
        ? "This will temporarily pause new submissions for this feedback form."
        : "This will reopen the feedback form for new submissions.",
    action: async () => {
      confirmDialog.value.loading = true;
      try {
        if (feedback.status === "active") {
          await feedbackStore.closeCurrentFeedback(feedback.id);
        } else {
          await feedbackStore.reopenCurrentFeedback(feedback.id);
        }
        await refreshFeedbacks();
        confirmDialog.value.show = false;
      } catch (err) {
        console.error("Failed to toggle feedback status:", err);
      } finally {
        confirmDialog.value.loading = false;
      }
    },
    loading: false,
  };
};

const deleteFeedback = (feedback: Feedback) => {
  confirmDialog.value = {
    show: true,
    title: "Delete Feedback Form?",
    message: `Are you sure you want to delete "${feedback.title}"? This action cannot be undone.`,
    action: async () => {
      confirmDialog.value.loading = true;
      try {
        await feedbackStore.deleteFeedback(feedback.id);
        await refreshFeedbacks();
        confirmDialog.value.show = false;
      } catch (err) {
        console.error("Failed to delete feedback:", err);
      } finally {
        confirmDialog.value.loading = false;
      }
    },
    loading: false,
  };
};

const refreshFeedbacks = async () => {
  try {
    await feedbackStore.fetchAllFeedbacks(eventStore.currentEvent?.id);
  } catch (err) {
    console.error("Failed to refresh feedbacks:", err);
  }
};

const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: "success",
    draft: "warning",
    closed: "grey",
    archived: "orange",
  };
  return colors[status] || "grey";
};

// Lifecycle
onMounted(() => {
  refreshFeedbacks();
});

// Watch for event changes
watch(
  () => eventStore.currentEvent,
  () => {
    refreshFeedbacks();
  }
);
</script>

<style scoped>
/* Card styles */
.feedback-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  height: 100%;
}

.feedback-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}

.active-card {
  border-left: 4px solid #4caf50;
}

/* Stat cards */
.stat-card {
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

/* Text utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-row.flex-wrap {
    flex-direction: column;
    align-items: stretch !important;
  }

  .v-row.flex-wrap > * {
    width: 100%;
    margin-bottom: 8px;
  }
}

/* Spacing utilities */
.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

/* Smooth transitions */
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Ensure equal card heights in grid */
.v-col {
  display: flex;
}
</style>