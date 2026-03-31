<template>
  <v-card
    class="event-card py-6 px-5 mx-auto my-6 position-relative"
    elevation="10"
    max-width="45rem"
  >
    <!-- CLOSE BUTTON -->
    <v-btn
      icon
      variant="text"
      size="small"
      class="close-btn"
      @click="dialogStore.close()"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>

    <v-card-title class="text-h6 font-weight-bold pb-1">
      Create New Event
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

      <!-- EVENT FORM -->
      <div class="fade-in">
        <v-form ref="formRef" @submit.prevent="createNewEvent">
          <v-text-field
            v-model="form.title"
            label="Event Title"
            prepend-icon="mdi-calendar-star"
            :rules="[requiredRule]"
            required
            rounded="sm"
          />

          <v-textarea
            v-model="form.description"
            label="Description"
            auto-grow
            rows="2"
            rounded="sm"
            prepend-icon="mdi-text"
          />

          <v-select
            v-model="form.eventType"
            :items="eventTypes"
            label="Event Type"
            prepend-icon="mdi-shape"
            :rules="[requiredRule]"
            required
            rounded="sm"
          />

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.dateTime.start"
                label="Start Date & Time"
                type="datetime-local"
                prepend-icon="mdi-calendar-start"
                variant="outlined"
                :rules="[requiredRule, startTimeRule]"
                required
                class="rounded-lg"
                :min="minStartDateTime"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.dateTime.end"
                label="End Date & Time"
                type="datetime-local"
                prepend-icon="mdi-calendar-end"
                variant="outlined"
                :rules="[requiredRule, endTimeRule]"
                required
                class="rounded-lg"
                :min="form.dateTime.start || minStartDateTime"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="form.location.name"
            label="Venue / Hall Name"
            rounded="sm"
            prepend-icon="mdi-map-marker"
            :rules="[requiredRule]"
            required
          />

          <v-text-field
            v-model="form.location.address"
            label="Address"
            rounded="sm"
            prepend-icon="mdi-home-map-marker"
            :rules="[requiredRule]"
            required
          />

          <v-text-field
            v-model.number="form.capacity.maxParticipants"
            label="Capacity"
            type="number"
            disabled
            prepend-icon="mdi-account-group"
            placeholder="e.g. 200"
            :min="1"
            :rules="[capacityRule]"
            rounded="sm"
          />
        </v-form>
      </div>
    </v-card-text>

    <v-divider class="my-2" />

    <v-card-actions class="justify-end">
      <v-btn variant="text" @click="resetForm" :disabled="isLoading">
        Clear
      </v-btn>

      <v-btn variant="text" @click="dialogStore.close()" :disabled="isLoading">
        Cancel
      </v-btn>

      <v-btn
        color="primary"
        variant="flat"
        :loading="isLoading"
        :disabled="!isFormValid"
        @click="createNewEvent"
      >
        Create Event
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useEventStore } from "@/stores/event";
import { useOrganizationStore } from "@/stores/organization";
import { useDialogStore } from "@/stores/dialog";
import { DateTime } from "luxon";
import { useRouter } from "vue-router";

const router = useRouter();
// Stores
const userStore = useUserStore();
const eventStore = useEventStore();
const dialogStore = useDialogStore();
const orgStore = useOrganizationStore();

// Refs
const formRef = ref(null);
const isLoading = ref(false);
const error = ref(null);
const success = ref(null);

// Constants - Updated to match GraphQL enum values
const eventTypes = [
  { title: "Conference", value: "CONFERENCE" },
  { title: "Workshop", value: "WORKSHOP" },
  { title: "Meetup", value: "MEETUP" },
  { title: "Webinar", value: "WEBINAR" },
  { title: "Training", value: "TRAINING" },
  { title: "Reception", value: "RECEPTION" },
  { title: "Seminar", value: "SEMINAR" },
];

const MINUTES_BUFFER = 15;

// Default date calculations
const getDefaultStartDateTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0); // 8:00 AM
  return tomorrow.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
};

const getDefaultEndDateTime = (startDateTime) => {
  if (!startDateTime) return "";
  const end = new Date(startDateTime);
  end.setHours(17, 0, 0, 0); // 5:00 PM same day
  return end.toISOString().slice(0, 16);
};

// Initialize form with default values
const initializeForm = () => ({
  title: "",
  description: "",
  eventType: "WORKSHOP", // Default event type - using enum value
  dateTime: {
    start: getDefaultStartDateTime(),
    end: getDefaultEndDateTime(getDefaultStartDateTime()),
  },
  location: {
    name: "",
    address: "",
    virtualLink: "",
    isVirtual: false,
  },
  capacity: {
    maxParticipants: 25, // Default capacity
  },
  tags: [],
  categories: [],
  metadata: {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language || "en-US",
  },
});

const form = ref(initializeForm());

// Computed properties
const minStartDateTime = computed(() => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + MINUTES_BUFFER);
  return now.toISOString().slice(0, 16);
});

const isFormValid = computed(() => {
  return (
    form.value.title &&
    form.value.eventType &&
    form.value.location.name &&
    form.value.location.address &&
    form.value.dateTime.start &&
    form.value.dateTime.end &&
    isStartTimeValid(form.value.dateTime.start) &&
    isEndAfterStart()
  );
});

// Validation rules
const requiredRule = (v) => !!v?.trim() || "This field is required";

const startTimeRule = (v) =>
  !v ||
  isStartTimeValid(v) ||
  `Start time must be at least ${MINUTES_BUFFER} minutes from now`;

const endTimeRule = (v) =>
  !v ||
  !form.value.dateTime.start ||
  isEndAfterStart() ||
  "End time must be after start time";

const capacityRule = (v) =>
  !v ||
  (v >= 1 && Number.isInteger(v)) ||
  "Capacity must be a positive integer";

// Methods
const isStartTimeValid = (datetimeString) => {
  if (!datetimeString) return false;
  const selected = new Date(datetimeString);
  const min = new Date();
  min.setMinutes(min.getMinutes() + MINUTES_BUFFER);
  return selected >= min;
};

const isEndAfterStart = () => {
  if (!form.value.dateTime.start || !form.value.dateTime.end) return false;
  return (
    new Date(form.value.dateTime.end) > new Date(form.value.dateTime.start)
  );
};

// Auto-update end time when start changes - but only if the current end time is the default
let isUpdatingEndTime = false;

watch(
  () => form.value.dateTime.start,
  (newStart) => {
    if (newStart && !isUpdatingEndTime) {
      isUpdatingEndTime = true;

      // Only auto-update end time if it's currently set to the default end time for the previous start
      const currentEnd = form.value.dateTime.end;
      const expectedDefaultEnd = getDefaultEndDateTime(newStart);

      // Update end time to maintain the 8AM-5PM pattern
      form.value.dateTime.end = getDefaultEndDateTime(newStart);

      // Reset the flag after a small delay
      setTimeout(() => {
        isUpdatingEndTime = false;
      }, 100);
    }
  },
);

const createNewEvent = async () => {
  error.value = null;
  success.value = null;
  // Validate form
  const { valid } = await formRef.value.validate();
  if (!valid) {
    error.value = "Please fill in all required fields correctly.";
    return;
  }

  if (!isEndAfterStart()) {
    error.value = "End time must be after start time.";
    return;
  }

  isLoading.value = true;

  try {
    // Prepare payload according to GraphQL CreateEventInput schema
    function enforceMax12Hours(startLocal, endLocal) {
      try {
        // Input validation
        if (startLocal == null || endLocal == null) {
          throw new Error("Start and end dates are required");
        }

        // Convert to UTC with comprehensive validation
        const startUTC = safeToUTC(startLocal);
        const endUTC = safeToUTC(endLocal);

        if (!startUTC || !endUTC) {
          throw new Error("Failed to convert dates to UTC");
        }

        const MAX_12H = 12 * 60 * 60 * 1000;

        // Calculate duration safely
        const startTime = startUTC.getTime();
        const endTime = endUTC.getTime();

        if (isNaN(startTime) || isNaN(endTime)) {
          throw new Error("Invalid timestamp values");
        }

        if (endTime < startTime) {
          throw new Error("End date cannot be before start date");
        }

        const duration = endTime - startTime;

        // Determine final end date
        const finalEndUTC =
          duration > MAX_12H ? new Date(startTime + MAX_12H) : endUTC;

        // Final validation
        if (isNaN(finalEndUTC.getTime())) {
          throw new Error("Resulting end date is invalid");
        }

        return {
          start: startUTC,
          end: finalEndUTC,
        };
      } catch (error) {
        console.error("Error in enforceMax12Hours:", error);
        // You can either re-throw, return a default, or handle differently
        throw error; // or return a safe default
      }
    }

    // Safe UTC conversion helper
    function safeToUTC(dateInput) {
      try {
        if (!dateInput) return null;

        // Handle various date formats
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return null;

        // Convert to UTC - adjust based on your toUTC implementation
        return new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
          ),
        );
      } catch {
        return null;
      }
    }

    const { start, end } = enforceMax12Hours(
      form.value.dateTime.start,
      form.value.dateTime.end,
    );

    await eventStore.createScheduledEvent({
      organizer: userStore.user.id,
      title: form.value.title.trim(),
      description: form.value.description?.trim() || "",
      eventType: form.value.eventType,

      subscriptionTier: "BUSINESS",
      organizationId: orgStore.currentOrganization?.id || null,
      dateTime: { start, end },
      location: {
        name: form.value.location.name.trim(),
        address: form.value.location.address.trim(),
        virtualLink: form.value.location.virtualLink?.trim() || "",
        isVirtual: form.value.location.isVirtual || false,
      },
      capacity: {
        maxParticipants: form.value.capacity.maxParticipants || 25,
      },
      // Optional fields - only include if they have values
      ...(form.value.tags &&
        form.value.tags.length > 0 && { tags: form.value.tags }),
      ...(form.value.categories &&
        form.value.categories.length > 0 && {
          categories: form.value.categories,
        }),
      ...(form.value.metadata && { metadata: form.value.metadata }),
    });

    success.value = "Event created successfully!";

    // Auto-close after success
    setTimeout(async () => {
      // Refresh entire dashboard

      localStorage.removeItem("defaultDashboard");
      await userStore.refreshDashboard();
      router.go("/");
    }, 1500);
  } catch (err) {
    console.error("Event creation error:", err);
    error.value = err.message || "Failed to create event. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  form.value = initializeForm();
  success.value = null;
  error.value = null;
  formRef.value?.resetValidation();
};

// Watch for form changes to clear errors
watch(
  [
    () => form.value.title,
    () => form.value.dateTime.start,
    () => form.value.dateTime.end,
  ],
  () => {
    if (error.value) error.value = null;
  },
);

// Initialize form on component mount
onMounted(() => {
  resetForm();
});
</script>

<style scoped>
.event-card {
  border-radius: 18px;
  animation: fadeIn 0.3s ease-in-out;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.fade-in {
  animation: fadeIn 0.35s ease-in-out;
}

.shake {
  animation: shake 0.25s linear;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  50% {
    transform: translateX(4px);
  }
  75% {
    transform: translateX(-4px);
  }
  100% {
    transform: translateX(0);
  }
}

/* Improve accessibility */
.v-alert {
  transition: opacity 0.2s ease;
}

.v-alert:active {
  opacity: 0.8;
}
</style>
