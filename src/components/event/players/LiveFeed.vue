<template>
  <v-app>
    <!-- ================= APP BAR ================= -->
    <v-app-bar
      color="rgba(60, 186, 198, 0.6)"
      density="comfortable"
      flat
      style="border-radius: 5px 5px 0px 0px"
    >
      <v-app-bar-title>
        {{ showAnalytics ? "Analytics" : "Live Feed" }}
      </v-app-bar-title>

      <v-spacer />

      <v-btn variant="outlined" color="white" @click="toggleAnalytics">
        <v-icon start>mdi-toggle-switch-outline</v-icon>
        {{ showAnalytics ? "Live" : "Analytics" }}
      </v-btn>
    </v-app-bar>

    <!-- ================= MAIN ================= -->
    <v-main>
      <div class="live-feed-container">
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
          <div class="mt-3 text-white">Loading Live Feeds…</div>
        </v-overlay>

        <!-- Analytics -->
        <AnalyticsView
          v-if="showAnalytics"
          :viewMode="'analytics'"
        />

        <!-- Live Feed -->
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
import { ref, computed, onMounted, watch } from "vue"
import { storeToRefs } from "pinia"

// --------------------
// Views
// --------------------
import AnalyticsView from "./LiveFeed/AnalyticsView.vue"
import FacilitatorView from "./LiveFeed/FacilitatorView.vue"
import ParticipantView from "./LiveFeed/ParticipantView.vue"

// --------------------
// Stores
// --------------------
import { useLiveFeedStore } from "@/stores/livefeed"
import { useEventStore } from "@/stores/event"

// --------------------
// Constants
// --------------------
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 50

// --------------------
// Store instances
// --------------------
const livefeedStore = useLiveFeedStore()
const eventStore = useEventStore()

const { loading } = storeToRefs(livefeedStore)

// --------------------
// UI State
// --------------------
const showAnalytics = ref(false)
const userRole = ref<"Participant" | "Facilitator">("Facilitator")

// --------------------
// Role detection (optimized)
// --------------------
const determineUserRole = () => {
  const storedRole = localStorage.getItem("defaultDashboard")
  userRole.value = storedRole === "PARTICIPANT" ? "Participant" : "Facilitator"
}

// --------------------
// Event handling (optimized with proper args)
// --------------------
const currentEventId = computed(() => eventStore.currentEvent?.id ?? null)

const fetchFeeds = async (eventId: string) => {
  // Clear previous event's feeds first
  livefeedStore.clearFeeds()
  
  // Fetch with proper pagination args
  await livefeedStore.fetchFeedsByEvent(eventId, DEFAULT_PAGE, DEFAULT_LIMIT)
}

// Debounced watch to prevent rapid refetching
let fetchTimeout: number | null = null

const debouncedFetch = async (eventId: string) => {
  if (fetchTimeout) {
    clearTimeout(fetchTimeout)
  }
  
  fetchTimeout = window.setTimeout(async () => {
    await fetchFeeds(eventId)
    fetchTimeout = null
  }, 100) // Small debounce for rapid event switches
}

// Initial load
onMounted(async () => {
  determineUserRole()

  if (currentEventId.value) {
    await fetchFeeds(currentEventId.value)
  }
})

// React to event changes with debouncing
watch(currentEventId, async (newId, oldId) => {
  if (!newId || newId === oldId) return
  await debouncedFetch(newId)
})

// Cleanup on unmount
import { onUnmounted } from "vue"
onUnmounted(() => {
  if (fetchTimeout) {
    clearTimeout(fetchTimeout)
  }
  livefeedStore.clearFeeds() // Clean up store when component unmounts
})

// --------------------
// UI Actions
// --------------------
const toggleAnalytics = () => {
  showAnalytics.value = !showAnalytics.value
}

// --------------------
// Dynamic view resolver
// --------------------
const currentView = computed(() =>
  userRole.value === "Participant" ? ParticipantView : FacilitatorView
)

// --------------------
// Optional: Export role for child components if needed
// --------------------
defineExpose({
  userRole
})
</script>

<style scoped>
.live-feed-container {
  position: relative;
  padding: 0;
  min-height: calc(100vh - 56px); /* app-bar height */
}
</style>