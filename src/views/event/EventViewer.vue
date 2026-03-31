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

const showDetailsDialog = ref(false);
const showLeaveDialog = ref(false);
const leavingEvent = ref(false);

const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

// ---------------------------
// DYNAMIC VIEWER (🔥 NEW)
// ---------------------------
const roleViewerComponent = shallowRef(null);

const viewers = {
  ADMIN: () => import("@/components/event/viewers/EventAdmin.vue"),
  FACILITATOR: () =>
    import("@/components/event/viewers/EventFacilitator.vue"),
  PARTICIPANT: () =>
    import("@/components/event/viewers/EventParticipant.vue"),
};

const FallbackViewer = {
  template: `<div class="pa-8 text-center">Viewer unavailable</div>`,
};

// Role priority
const ROLE_PRIORITY = ["ADMIN", "FACILITATOR", "PARTICIPANT"];

// Resolve role from event arrays
const resolveUserRole = (): string => {
  if (!event.value || !userStore.user) return "PARTICIPANT";

  const userId = userStore.user.id;
  const roles: string[] = [];

  if (event.value.admins?.some((u: any) => u.id === userId)) {
    roles.push("ADMIN");
  }

  if (event.value.facilitators?.some((u: any) => u.id === userId)) {
    roles.push("FACILITATOR");
  }

  if (event.value.participants?.some((u: any) => u.id === userId)) {
    roles.push("PARTICIPANT");
  }

  return ROLE_PRIORITY.find((r) => roles.includes(r)) || "PARTICIPANT";
};

// Watch → load correct viewer
watch(
  [event, () => userStore.user],
  () => {
    if (!event.value) return;

    const role = resolveUserRole();
    const loader = viewers[role] || viewers.PARTICIPANT;

    roleViewerComponent.value = defineAsyncComponent({
      loader,
      errorComponent: FallbackViewer,
    });
  },
  { immediate: true }
);

// ---------------------------
// COMPUTED
// ---------------------------
const isAuthenticated = computed(() => userStore.isAuthenticated);

const isParticipant = computed(() => {
  if (!event.value || !userStore.user) return false;
  return (
    event.value.participants?.some(
      (p: any) => p.id === userStore.user?.id
    ) || false
  );
});

// ---------------------------
// METHODS
// ---------------------------
const goBack = () => router.push("/events");

const shareEvent = async () => {
  if (!event.value) return;

  const shareData = {
    title: event.value.title,
    text: `Join me for ${event.value.title}!`,
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await copyEventLink();
    }
  } catch {}
};

const copyEventLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showNotification("Event link copied!", "success");
  } catch {
    showNotification("Failed to copy link", "error");
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showNotification("Copied!", "success");
  } catch {
    showNotification("Copy failed", "error");
  }
};

const viewEventDetails = () => (showDetailsDialog.value = true);
const leaveEvent = () => (showLeaveDialog.value = true);

const confirmLeaveEvent = async () => {
  if (!event.value) return;

  leavingEvent.value = true;
  try {
    await eventStore.leaveEvent(event.value.id);
    showNotification("Left event", "success");

    setTimeout(() => router.push("/events"), 1200);
  } catch (err: any) {
    showNotification(err.message || "Failed", "error");
  } finally {
    leavingEvent.value = false;
    showLeaveDialog.value = false;
  }
};

const refreshEvent = async () => {
  if (!event.value?.id) return;

  await eventStore.fetchEvent(event.value.id);
  event.value = eventStore.currentEvent;
};

const handleEventUpdate = (updated: Event) => {
  event.value = updated;
  showNotification("Event updated");
};

const formatDateTime = (d: string) => new Date(d).toLocaleString();

const showNotification = (message: string, color = "success") => {
  snackbar.value = { show: true, message, color };
};

// ---------------------------
// INIT
// ---------------------------
const parseQueryParams = () => {
  const { accessKey, phone, eventSecret, key } = route.query;

  accessSecret.value = (accessKey || eventSecret || key) as string;
  phoneNumber.value = phone as string;
};

onMounted(() => {
  parseQueryParams();

  if (eventStore.currentEvent) {
    event.value = eventStore.currentEvent;
  }
});

onUnmounted(() => {
  eventStore.clearError();
});
</script>

<template>
  <div class="event-viewer-page">
    <!-- HEADER -->
    <v-app-bar color="primary" dark prominent v-if="event">
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <v-toolbar-title>{{ event.title }}</v-toolbar-title>

      <v-spacer />

      <v-btn icon @click="shareEvent">
        <v-icon>mdi-share-variant</v-icon>
      </v-btn>

      <v-menu v-if="isAuthenticated">
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="copyEventLink">
            <v-list-item-title>Copy Event Link</v-list-item-title>
          </v-list-item>

          <v-list-item @click="viewEventDetails">
            <v-list-item-title>Event Details</v-list-item-title>
          </v-list-item>

          <v-divider />

          <v-list-item v-if="isParticipant" @click="leaveEvent">
            <v-list-item-title class="text-error">
              Leave Event
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- 🔥 DYNAMIC VIEWER -->
    <v-main>
      <component
        :is="roleViewerComponent"
        v-if="roleViewerComponent"
        :event="event"
        :access-secret="accessSecret"
        :phone-number="phoneNumber"
        @refresh="refreshEvent"
        @update-event="handleEventUpdate"
      />
    </v-main>

    <!-- DETAILS DIALOG -->
    <v-dialog v-model="showDetailsDialog" max-width="600">
      <v-card>
        <v-card-title>Event Details</v-card-title>

        <v-card-text v-if="event">
          {{ event.title }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDetailsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- LEAVE DIALOG -->
    <v-dialog v-model="showLeaveDialog" max-width="400">
      <v-card>
        <v-card-title>Leave Event</v-card-title>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showLeaveDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmLeaveEvent">
            Leave
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SNACKBAR -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<style scoped>
.event-viewer-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>