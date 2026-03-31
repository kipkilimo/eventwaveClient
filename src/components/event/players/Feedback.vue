<template>
  <v-app>
    <!-- ================= APP BAR ================= -->
    <v-app-bar
      :color="appBarColor"
      density="comfortable"
      flat
      :style="appBarStyle"
    >
      <v-app-bar-title>
        {{ showAnalytics ? "Feedback Analytics" : "Attendee Feedback" }}
      </v-app-bar-title>

      <v-spacer />

      <v-btn variant="outlined" color="white" @click="toggleAnalytics">
        <v-icon start>mdi-toggle-switch-outline</v-icon>
        {{ showAnalytics ? "Live" : "Analytics" }}
      </v-btn>
    </v-app-bar>

    <!-- ================= MAIN ================= -->
    <v-main>
      <div class="feedback-container">
        <!-- Global loading overlay -->
        <v-overlay
          :model-value="loading"
          class="align-center justify-center"
          persistent
        >
          <v-progress-circular
            color="primary"
            size="64"
            indeterminate
          />
          <div class="mt-3 text-white">{{ loadingMessage }}</div>
        </v-overlay>

        <!-- Analytics View -->
        <AnalyticsView
          v-if="showAnalytics"
          :viewMode="'analytics'"
          v-show="!loading"
        />

        <!-- Live Feedback View -->
        <component
          v-else
          :is="currentView"
          :viewMode="'live'"
          v-show="!loading"
        />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue"
import { storeToRefs } from "pinia"
import { defineAsyncComponent } from "vue"

// --------------------
// Stores
// --------------------
import { useFeedbackStore } from "@/stores/feedback"
import { useEventStore } from "@/stores/event"

// --------------------
// Components
// --------------------
import AnalyticsView from "./Feedback/AnalyticsView.vue"

// Lazy-loaded views
const FacilitatorView = defineAsyncComponent(() => 
  import("./Feedback/FacilitatorView.vue")
)
const ParticipantView = defineAsyncComponent(() => 
  import("./Feedback/ParticipantView.vue")
)

// --------------------
// Constants
// --------------------
const DEBOUNCE_DELAY = 300

// --------------------
// Store instances
// --------------------
const feedbackStore = useFeedbackStore()
const eventStore = useEventStore()

const { loading: feedbackLoading, error: feedbackError } = storeToRefs(feedbackStore)

// --------------------
// UI State
// --------------------
const showAnalytics = ref(false)
const userRole = ref<"Participant" | "Facilitator">("Facilitator")
const error = ref<string | null>(null)
const selectedEvent = ref<string | null>(null)

// Dummy events list
const availableEvents = ref([
  { id: "event-1", title: "Product Launch 2024" },
  { id: "event-2", title: "Tech Conference" },
  { id: "event-3", title: "Team Workshop" },
])

// Fetch control
const fetchTimeout = ref<number | null>(null)
const abortController = ref<AbortController | null>(null)

// --------------------
// Computed Properties
// --------------------
const currentEventId = computed(() => 
  eventStore.currentEvent?.id ?? selectedEvent.value
)

const currentEventTitle = computed(() => {
  const event = availableEvents.value.find(e => e.id === currentEventId.value)
  return event?.title || eventStore.currentEvent?.title
})

const currentView = computed(() => 
  userRole.value === "Participant" ? ParticipantView : FacilitatorView
)

const loading = computed(() => feedbackLoading.value)

const loadingMessage = computed(() => 
  showAnalytics.value ? "Loading Analytics..." : "Loading Feedback..."
)

const appBarColor = computed(() => 
  showAnalytics.value ? "rgba(94, 53, 177, 0.6)" : "#3b56a1"
)

const appBarStyle = computed(() => ({ 
  borderRadius: "5px 5px 0 0", 
  backdropFilter: "blur(10px)" 
}))

// --------------------
// Role Detection
// --------------------
const determineUserRole = () => {
  const storedRole = localStorage.getItem("defaultDashboard")
  userRole.value = storedRole === "PARTICIPANT" ? "Participant" : "Facilitator"
}

// --------------------
// Fetch Handling
// --------------------
const fetchFeedbacks = async (eventId: string) => {
  if (!eventId) return
  
  try {
    error.value = null
    
    // Clean up previous fetch
    if (abortController.value) {
      abortController.value.abort()
    }
    abortController.value = new AbortController()

    // Reset store state
    feedbackStore.reset()
    feedbackStore.initSocket(eventId)

    // Fetch based on view mode
    if (showAnalytics.value) {
      await feedbackStore.fetchFeedbackAnalytics(eventId)
    } else {
      await feedbackStore.fetchAllFeedbacks(eventId)
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return
    error.value = feedbackError.value || err.message || "Failed to load feedback. Please try again."
    console.error("Error fetching feedback:", err)
  }
}

const debouncedFetch = (eventId: string) => {
  if (fetchTimeout.value) {
    clearTimeout(fetchTimeout.value)
  }
  
  fetchTimeout.value = window.setTimeout(() => {
    fetchFeedbacks(eventId)
    fetchTimeout.value = null
  }, DEBOUNCE_DELAY)
}

// --------------------
// Event Handling
// --------------------
const onEventChange = async (eventId: string) => {
  const event = availableEvents.value.find(e => e.id === eventId)
  if (event) {
    eventStore.setCurrentEvent({ id: event.id, title: event.title })
  }
  debouncedFetch(eventId)
}

// --------------------
// Lifecycle
// --------------------
onMounted(async () => {
  determineUserRole()

  if (!currentEventId.value && availableEvents.value.length > 0) {
    selectedEvent.value = availableEvents.value[0].id
    await onEventChange(selectedEvent.value)
  } else if (currentEventId.value) {
    await debouncedFetch(currentEventId.value)
  }
})

// Watch for event changes
watch(currentEventId, (newId, oldId) => {
  if (!newId || newId === oldId) return
  debouncedFetch(newId)
})

// Watch for analytics toggle
watch(showAnalytics, () => {
  if (currentEventId.value) {
    debouncedFetch(currentEventId.value)
  }
})

// Cleanup
onUnmounted(() => {
  if (fetchTimeout.value) {
    clearTimeout(fetchTimeout.value)
  }
  if (abortController.value) {
    abortController.value.abort()
  }
  feedbackStore.reset()
})

// --------------------
// UI Actions
// --------------------
const toggleAnalytics = () => {
  showAnalytics.value = !showAnalytics.value
}

// --------------------
// Expose
// --------------------
defineExpose({
  userRole,
  currentEventId,
  refresh: () => { 
    if (currentEventId.value) {
      return fetchFeedbacks(currentEventId.value)
    }
  },
  feedbacks: feedbackStore.feedbacks,
  analytics: feedbackStore.analytics,
})
</script>

<style scoped>
.feedback-container {
  position: relative;
  padding: 0;
  min-height: calc(100vh - 56px); /* app-bar height */
}
</style>