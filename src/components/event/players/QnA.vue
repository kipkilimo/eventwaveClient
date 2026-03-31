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
        {{ showAnalytics ? "Q&A Analytics" : "Question & Answers" }}
      </v-app-bar-title>

      <v-spacer />

      <v-btn
        variant="outlined"
        color="white"
        :prepend-icon="showAnalytics ? 'mdi-chart-bar' : 'mdi-forum'"
        @click="toggleAnalytics"
      >
        {{ showAnalytics ? "Live" : "Analytics" }}
      </v-btn>
    </v-app-bar>

    <!-- ================= MAIN ================= -->
    <v-main>
      <div class="qna-container">
        <!-- Global loading overlay -->
        <v-overlay
          :model-value="loading && !error"
          class="align-center justify-center"
          persistent
          z-index="9999"
        >
          <div class="text-center">
            <v-progress-circular
              color="primary"
              size="64"
              indeterminate
            />
            <div class="mt-3 text-white">Loading Q&A...</div>
          </div>
        </v-overlay>

        <!-- Error State -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="ma-4"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <!-- Analytics View -->
        <AnalyticsView
          v-if="showAnalytics && !loading"
          :viewMode="'analytics'"
          :key="`analytics-${currentEventId}`"
        />

        <!-- Question & Answer User Views -->
        <template v-else-if="!loading && !error">
          <component
            :is="currentView"
            :viewMode="'live'"
            :key="`${userRole}-${currentEventId}`"
          />
        </template>

        <!-- Empty State -->
        <v-container
          v-if="!loading && !error && !showAnalytics && !currentEventId"
          class="fill-height d-flex align-center justify-center"
        >
          <v-card variant="outlined" class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-forum-question
            </v-icon>
            <h3 class="text-h6 mb-2">No Event Selected</h3>
            <p class="text-body-2 text-grey">
              Please select an event to view Q&A
            </p>
          </v-card>
        </v-container>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  onMounted, 
  watch, 
  onUnmounted,
  defineAsyncComponent,
  onBeforeUnmount 
} from "vue"
import { storeToRefs } from "pinia"
import type { Component } from "vue"

// --------------------
// Views (Lazy loaded for better performance)
// --------------------
import AnalyticsView from "./QnA/AnalyticsView.vue"
const FacilitatorView = defineAsyncComponent(() => 
  import("./QnA/FacilitatorView.vue")
)
const ParticipantView = defineAsyncComponent(() => 
  import("./QnA/ParticipantView.vue")
)

// --------------------
// Stores
// --------------------
import { useQnAStore } from "@/stores/qna"
import { useEventStore } from "@/stores/event"

// --------------------
// Constants
// --------------------
const APP_BAR_COLOR = "rgba(60, 186, 198, 0.6)"
const DEBOUNCE_DELAY = 300 // Increased for better performance

// --------------------
// Store instances
// --------------------
const qnaStore = useQnAStore()
const eventStore = useEventStore()
const { loading } = storeToRefs(qnaStore)

// --------------------
// UI State
// --------------------
const showAnalytics = ref(false)
const userRole = ref<"Participant" | "Facilitator">("Facilitator")
const error = ref<string | null>(null)

// --------------------
// Computed Properties
// --------------------
const currentEventId = computed(() => eventStore.currentEvent?.id ?? null)
const appBarColor = computed(() => showAnalytics.value 
  ? "rgba(94, 53, 177, 0.6)" // Purple for analytics mode
  : APP_BAR_COLOR
)
const appBarStyle = computed(() => ({
  borderRadius: "5px 5px 0px 0px",
  backdropFilter: "blur(10px)",
}))

const currentView = computed<Component>(() => 
  userRole.value === "Participant" ? ParticipantView : FacilitatorView
)

// --------------------
// Refs for cleanup
// --------------------
const fetchTimeout = ref<number | null>(null)
const abortController = ref<AbortController | null>(null)

// --------------------
// Role detection
// --------------------
const determineUserRole = (): void => {
  try {
    const storedRole = localStorage.getItem("defaultDashboard")
    userRole.value = storedRole === "PARTICIPANT" ? "Participant" : "Facilitator"
  } catch (e) {
    console.warn("Failed to determine user role:", e)
    userRole.value = "Facilitator" // Default to facilitator
  }
}

// --------------------
// Event handling
// --------------------
const fetchQnA = async (eventId: string): Promise<void> => {
  if (!eventId) return
  
  try {
    error.value = null
    
    // Create new abort controller for this request
    if (abortController.value) {
      abortController.value.abort()
    }
    abortController.value = new AbortController()
    
    // Clear previous event's QnA first
    qnaStore.clearQnA()
    
    // Fetch QnA for the event
    await qnaStore.fetchEventQnA(eventId)
    
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.log('QnA fetch aborted')
      return
    }
    
    error.value = err.message || "Failed to load Q&A. Please try again."
    console.error("Error fetching QnA:", err)
  }
}

// Debounced watch with proper cleanup
const debouncedFetch = (eventId: string): void => {
  if (fetchTimeout.value) {
    clearTimeout(fetchTimeout.value)
  }
  
  fetchTimeout.value = window.setTimeout(async () => {
    if (eventId) {
      await fetchQnA(eventId)
    }
    fetchTimeout.value = null
  }, DEBOUNCE_DELAY)
}

// --------------------
// Lifecycle Hooks
// --------------------
onMounted(async () => {
  determineUserRole()
  
  if (currentEventId.value) {
    await fetchQnA(currentEventId.value)
  }
})

// React to event changes with debouncing
watch(currentEventId, async (newId, oldId) => {
  if (!newId || newId === oldId) return
  await debouncedFetch(newId)
})

// --------------------
// Cleanup
// --------------------
const cleanup = (): void => {
  // Clear any pending timeout
  if (fetchTimeout.value) {
    clearTimeout(fetchTimeout.value)
    fetchTimeout.value = null
  }
  
  // Abort any pending fetch
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
  
  // Clean up store state
  qnaStore.clearQnA()
  qnaStore.clearSocketState()
}

onBeforeUnmount(cleanup)
onUnmounted(cleanup)

// --------------------
// UI Actions
// --------------------
const toggleAnalytics = (): void => {
  showAnalytics.value = !showAnalytics.value
}

// --------------------
// Expose for parent components
// --------------------
defineExpose({
  userRole,
  currentEventId,
  refresh: () => currentEventId.value && fetchQnA(currentEventId.value),
})
</script>

<style scoped>
.qna-container {
  position: relative;
  padding: 0;
  min-height: calc(100vh - 64px); /* Increased for better spacing */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Smooth transitions */
.v-app-bar {
  transition: all 0.3s ease;
}

/* Better overlay styling */
.v-overlay :deep(.v-overlay__scrim) {
  background-color: rgba(0, 0, 0, 0.7);
}
</style>

<style>
/* Global transitions for component switching */
.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.3s ease;
}

.component-fade-enter-from,
.component-fade-leave-to {
  opacity: 0;
}
</style>