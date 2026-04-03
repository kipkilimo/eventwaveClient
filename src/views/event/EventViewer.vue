<template>
  <div>
    <!-- DYNAMIC VIEWER BASED ON ROLE -->
    <component
      :is="roleViewerComponent"
      v-if="roleViewerComponent && event"
      :event="event"
      :event-id="event.id"
      :event-data="event"
      :access-secret="accessSecret"
      :phone-number="phoneNumber"
      @refresh="refreshEvent"
      @update-event="handleEventUpdate"
    />
    
    <!-- Loading State -->
    <v-container v-else-if="eventStore.isLoading" fluid class="pa-4 pa-md-6">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          />
          <p class="mt-4 text-body-1">Loading event details...</p>
        </v-col>
      </v-row>
    </v-container>

    <!-- Error State -->
    <v-container v-else-if="eventStore.error" fluid class="pa-4 pa-md-6">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-icon size="64" color="error">mdi-alert-circle</v-icon>
          <p class="mt-4 text-body-1">{{ eventStore.error }}</p>
          <v-btn color="primary" @click="refreshEvent">Retry</v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- No Event State -->
    <v-container v-else fluid class="pa-4 pa-md-6">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-icon size="64" color="warning">mdi-calendar-blank</v-icon>
          <p class="mt-4 text-body-1">No event found</p>
          <v-btn color="primary" @click="goBack">Back to Events</v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- SNACKBAR -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color"
      timeout="3000"
      location="bottom"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  shallowRef,
  watch,
  defineAsyncComponent,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEventStore } from "@/stores/event";
import { useUserStore } from "@/stores/user";
import type { Event } from "@/stores/event";

// Router
const route = useRoute();
const router = useRouter();

// Stores
const eventStore = useEventStore();
const userStore = useUserStore();

// ---------------------------
// STATE
// ---------------------------
const event = ref<Event | null>(null);
const accessSecret = ref<string | null>(null);
const phoneNumber = ref<string | null>(null);

const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

// ---------------------------
// DYNAMIC VIEWER
// ---------------------------
const roleViewerComponent = shallowRef<any>(null);

const viewers = {
  ADMIN: () => import("@/components/event/viewers/EventAdmin.vue"),
  FACILITATOR: () => import("@/components/event/viewers/EventFacilitator.vue"),
  PARTICIPANT: () => import("@/components/event/viewers/EventParticipant.vue"),
};

const FallbackViewer = {
  template: `<div class="pa-8 text-center">
    <v-icon size="64" color="warning">mdi-account-alert</v-icon>
    <p class="mt-4">Unable to load viewer for your role</p>
    <v-btn color="primary" @click="$router.push('/events')">Back to Events</v-btn>
  </div>`,
};

// Role priority
const ROLE_PRIORITY = ["ADMIN", "FACILITATOR", "PARTICIPANT"];

// Resolve role from event arrays
const resolveUserRole = (): string => {
  if (!event.value || !userStore.user) return "PARTICIPANT";

  const userId = userStore.user.id;
  const roles: string[] = [];

  // Check admin status
  if (event.value.admins?.some((u: any) => u.id === userId || u === userId)) {
    roles.push("ADMIN");
  }

  // Check facilitator status
  if (event.value.facilitators?.some((u: any) => u.id === userId || u === userId)) {
    roles.push("FACILITATOR");
  }

  // Check participant status
  if (event.value.participants?.some((u: any) => u.id === userId || u === userId)) {
    roles.push("PARTICIPANT");
  }

  const role = ROLE_PRIORITY.find((r) => roles.includes(r)) || "PARTICIPANT";
  console.log(`Resolved user role: ${role}`, { userId, roles });
  
  return role;
};

// Watch event and user to load correct viewer
watch(
  [() => event.value, () => userStore.user],
  async () => {
    if (!event.value) {
      roleViewerComponent.value = null;
      return;
    }

    const role = resolveUserRole();
    const loader = viewers[role as keyof typeof viewers];

    if (!loader) {
      console.error(`No viewer found for role: ${role}`);
      roleViewerComponent.value = FallbackViewer;
      return;
    }

    try {
      roleViewerComponent.value = defineAsyncComponent({
        loader,
        loadingComponent: {
          template: `<div class="pa-8 text-center">
            <v-progress-circular indeterminate color="primary" />
            <p class="mt-4">Loading ${role.toLowerCase()} view...</p>
          </div>`,
        },
        errorComponent: FallbackViewer,
        delay: 200,
        timeout: 3000,
      });
    } catch (error) {
      console.error(`Failed to load viewer component for role ${role}:`, error);
      roleViewerComponent.value = FallbackViewer;
    }
  },
  { immediate: true, deep: true }
);

// ---------------------------
// COMPUTED
// ---------------------------
const isAuthenticated = computed(() => userStore.isAuthenticated);

// ---------------------------
// METHODS
// ---------------------------
const goBack = () => router.push("/events");

const refreshEvent = async () => {
  if (!event.value?.id) return;

  try {
    await eventStore.fetchEvent(event.value.id);
    event.value = eventStore.currentEvent;
    showNotification("Event refreshed", "info");
  } catch (err: any) {
    showNotification(err.message || "Failed to refresh event", "error");
  }
};

const handleEventUpdate = (updated: Event) => {
  event.value = updated;
  showNotification("Event updated successfully", "success");
};

const showNotification = (message: string, color = "success") => {
  snackbar.value = { show: true, message, color };
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    snackbar.value.show = false;
  }, 3000);
};

// ---------------------------
// INIT
// ---------------------------
const parseQueryParams = () => {
  const { accessKey, phone, eventSecret, key } = route.query;

  accessSecret.value = (accessKey || eventSecret || key) as string || null;
  phoneNumber.value = phone as string || null;
  
  if (accessSecret.value) {
    console.log("Access credentials found");
  }
};

// Fetch event by ID from route params
const fetchEvent = async () => {
  const eventId = route.params.id as string;
  
  if (!eventId) {
    console.error("No event ID provided in route params");
    showNotification("No event ID provided", "error");
    return;
  }

  console.log(`Fetching event with ID: ${eventId}`);
  
  try {
    await eventStore.fetchEvent(eventId);
    event.value = eventStore.currentEvent;
    
    if (!event.value) {
      showNotification("Event not found", "error");
    } else {
      console.log(`Event loaded: ${event.value.title}`);
    }
  } catch (err: any) {
    console.error("Failed to fetch event:", err);
    showNotification(err.message || "Failed to load event", "error");
  }
};

// Watch for route changes
watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      console.log(`Route changed to event ID: ${newId}`);
      await fetchEvent();
    }
  }
);

// Watch for authentication changes
watch(
  () => userStore.isAuthenticated,
  async (isAuth) => {
    if (isAuth && event.value?.id) {
      console.log("User authenticated, refreshing event data");
      await refreshEvent();
    }
  }
);

onMounted(async () => {
  console.log("EventViewer component mounted");
  parseQueryParams();
  
  // If event data is already in store, use it
  if (eventStore.currentEvent) {
    console.log("Using existing event from store");
    event.value = eventStore.currentEvent;
  } else {
    await fetchEvent();
  }
});

onUnmounted(() => {
  console.log("EventViewer component unmounted");
  eventStore.clearError();
});
</script>

<style scoped>
.event-viewer-page {
  min-height: 81vh;
  min-height: 81vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef2f5 100%);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>