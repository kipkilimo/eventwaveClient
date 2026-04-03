<script setup lang="ts">
import {
  shallowRef,
  ref,
  onMounted,
  watch,
  computed,
  defineAsyncComponent,
} from "vue";
import { useUserStore } from "@/stores/user";
import { useEventStore } from "@/stores/event";
import { usePlayerStore } from "@/stores/player";
import { useDialogStore } from "@/stores/dialog";
import PlanSelector from "@/components/dialogs/plans/PlanSelector.vue";

// Stores
const dialogStore = useDialogStore();
const userStore = useUserStore();
const eventStore = useEventStore();
const playerStore = usePlayerStore();

// State
const loading = ref(true);
const sessionValid = ref(false);
const errorMessage = ref("");
const dashboardComponent = shallowRef(null);
const activeToolComponent = shallowRef(null);
const planSelector = ref(null);

// Dashboards - pre-defined async components
const dashboards = {
  SUPER: defineAsyncComponent(() => import("@/components/dashboards/SuperDashboard.vue")),
  ADMIN: defineAsyncComponent(() => import("@/components/dashboards/AdminDashboard.vue")),
  FACILITATOR: defineAsyncComponent(() => import("@/components/dashboards/FacilitatorDashboard.vue")),
  PARTICIPANT: defineAsyncComponent(() => import("@/components/dashboards/ParticipantDashboard.vue")),
};

// Tools - pre-defined async components
const tools = {
  chat: defineAsyncComponent(() => import("@/components/event/players/Chat.vue")),
  poll: defineAsyncComponent(() => import("@/components/event/players/Poll.vue")),
  qna: defineAsyncComponent(() => import("@/components/event/players/QnA.vue")),
  feedback: defineAsyncComponent(() => import("@/components/event/players/Feedback.vue")),
  media: defineAsyncComponent(() => import("@/components/event/players/MediaPlayer.vue")),
  livefeed: defineAsyncComponent(() => import("@/components/event/players/LiveFeed.vue")),
};

// Computed
const isAuthenticated = computed(() => userStore.isAuthenticated);
const showPaymentDialog = () => dialogStore.open("paymentDialog");
const closePaymentDialog = () => dialogStore.close();

// Session validation - NO updateUser calls here!
// Session validation with user refresh
async function validateSession() {
  try {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (!token || !rawUser) {
      throw new Error("No session data found");
    }

    let userData;
    try {
      userData = JSON.parse(rawUser);
    } catch (parseError) {
      throw new Error("Invalid session data");
    }

    // Set token first
    userStore.setToken(token);
    
    // Refresh user data from server (safe local update, not mutation)
    try {
      const refreshedUser = await userStore.refreshUser(userData.id);
      userStore.setUser(refreshedUser); // ✅ local setter instead of mutation
      userData = refreshedUser;
    } catch (refreshError) {
      console.warn("Could not refresh user data, using cached data:", refreshError);
      // Continue with cached data
    }

    // Set event data if available
    const rawEvent = localStorage.getItem("event");
    if (rawEvent) {
      try {
        const eventData = JSON.parse(rawEvent);
        if (eventData?.id && eventData?.title) {
          eventStore.currentEvent = eventData;
        }
      } catch (parseError) {
        console.warn("Failed to parse event data");
      }
    }

    // Set dashboard
    const role = userData.role.toUpperCase();
    dashboardComponent.value = dashboards[role] || dashboards.PARTICIPANT;

    return true;
  } catch (error) {
    console.error("Session validation error:", error);
    errorMessage.value = error.message || "Session validation failed";
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("event");
    userStore.clearSession();
    
    return false;
  }
}


// Function to show plan selector
function showPlanSelector() {
  if (planSelector.value) {
    planSelector.value.showPlans = true;
  }
}

// Tool switching with error handling
watch(
  () => playerStore.currentActiveTool,
  (tool) => {
    if (!tool) {
      activeToolComponent.value = null;
      return;
    }
    
    const component = tools[tool];
    if (!component) {
      console.warn(`Tool "${tool}" not found`);
      activeToolComponent.value = null;
      return;
    }
    
    activeToolComponent.value = component;
  },
  { immediate: true },
);

// On mount
onMounted(async () => {
  loading.value = true;
  try {
    sessionValid.value = await validateSession();
  } catch (error) {
    console.error("Mount error:", error);
    sessionValid.value = false;
    errorMessage.value = "Failed to initialize application";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-container
    fluid
    class="pa-0"
    style="background-color: #dadada; min-height: 100vh"
  >
    <!-- Loading -->
    <div
      v-if="loading"
      class="d-flex flex-column align-center justify-center"
      style="height: 70vh"
    >
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4 text-body-1">Verifying your session...</p>
    </div>

    <!-- Error -->
    <div
      v-else-if="!sessionValid"
      class="d-flex flex-column align-center justify-center pa-8"
      style="height: 70vh"
    >
      <v-icon color="error" size="64" class="mb-4"
        >mdi-alert-circle-outline</v-icon
      >
      <p class="text-h6 font-weight-bold text-red mb-2">Session Error</p>
      <p class="text-body-1 text-center mb-4">
        {{ errorMessage || "Your session is invalid or has expired." }}
      </p>
      <v-btn color="info" to="/register" class="mt-2" @click="showPlanSelector">
        <v-icon start>mdi-information-slab-circle-outline</v-icon>
        Create an account for better experience
      </v-btn>
    </div>

    <!-- Main Content -->
    <div v-else>
      <component :is="dashboardComponent" v-if="!activeToolComponent" />
      <component
        :is="activeToolComponent"
        v-else
        :event-id="userStore.event?.id"
      />
    </div>

    <PlanSelector ref="planSelector" />
  </v-container>
</template>